// ============================================================
// PASSORA — Core Data Engine
// CBAM Steel Emission Calculator (aligned with Excel model)
// ============================================================

export interface FuelInput {
  name: string;
  amount: number;   // Nm3 or ton
  unit: string;
  ncv: number;      // TJ/unit
  ef: number;       // tCO2e/TJ
  oxidation: number;
  biomassShare: number;
}

export interface ElectricityInput {
  totalKwh: number;     // if using average EF
  onsiteKwh: number;    // if using split
  gridKwh: number;      // if using split
  onsiteEf: number;     // kgCO2e/kWh (Kardemir EPD: 1.8)
  gridEf: number;       // kgCO2e/kWh (Kardemir EPD: 0.91)
  avgEf: number;        // kgCO2e/kWh (Kardemir EPD: 1.45)
}

export interface PrecursorInput {
  name: string;
  amountTon: number;
  ef: number;           // tCO2e/ton
  note?: string;
}

export interface TransportInput {
  mode: string;         // Road, Rail, Sea
  massTon: number;
  distanceKm: number;
  efKgPerTkm: number;   // kgCO2e/t-km (DEFRA)
}

export interface SteelEmissionResult {
  // Components (tCO2e)
  directFuel: number;
  electricity: number;
  precursorTotal: number;
  transportTotal: number;
  // Totals
  totalEmbedded: number;
  specificEmbedded: number;     // tCO2e/ton
  dependentEmissions: number;   // grid electricity
  independentEmissions: number; // onsite fuel + precursor
  // EPD benchmark
  epdBenchmarkTotal: number;    // production × 2.29
  epdBenchmarkSpecific: number; // 2.29 tCO2e/ton (Kardemir)
  diffVsEpd: number;
  status: 'below' | 'above' | 'equal';
  // Method
  calculationMethod: 'actual_data' | 'epd_benchmark' | 'hybrid';
  isDefaultUsed: boolean;
  // Cost
  cbamCostEur: number;
  certificatesRequired: number;
}

// ── Emission Factors (from Excel Defaults sheet + DEFRA) ──────────────────────
export const EMISSION_FACTORS = {
  // Electricity (Kardemir EPD)
  onsiteElectricity:  1.80,   // kgCO2e/kWh
  gridResidual:       0.91,   // kgCO2e/kWh
  averageElectricity: 1.45,   // kgCO2e/kWh
  turkeyGrid:         0.4437, // tCO2e/MWh (TEIAS 2024)

  // EPD Benchmark (Kardemir Steel Profiles)
  epdA1A3: 2.29,    // tCO2e/ton
  epdA4:   0.0462,  // tCO2e/ton

  // EU CBAM Defaults (tCO2e/ton)
  steelHotRolled:    1.89,
  steelColdRolled:   2.02,
  steelBOF:          2.20,   // BF-BOF benchmark
  steelEAF:          0.40,   // Scrap-EAF benchmark
  steelDRIEAF:       0.481,  // DRI-EAF benchmark

  // DEFRA Transport (kgCO2e/t-km)
  road:  0.062,
  rail:  0.022,
  sea:   0.011,
  air:   1.020,

  // Fuels (NCV defaults)
  naturalGasNcv:    3.4e-5,  // TJ/Nm3
  naturalGasEf:     56.1,    // tCO2e/TJ
  cokeOvenGasNcv:   1.7e-5,  // TJ/Nm3
  cokeOvenGasEf:    44.4,    // tCO2e/TJ
  blastFurnaceNcv:  3.3e-6,  // TJ/Nm3
  blastFurnaceEf:   260.0,   // tCO2e/TJ
  coalEf:           94.6,    // tCO2e/TJ
  cokingCoalEf:     107.0,   // tCO2e/TJ
};

// Current EU ETS price (Q1 2026)
export const ETS_PRICE_EUR = 75.36; // €/tCO2

// Sector benchmarks for comparison
export const SECTOR_BENCHMARKS = {
  BOF:   { label: 'BF-BOF (Entegre)', specific: 2.20, color: '#ef4444' },
  DRIEAF: { label: 'DRI-EAF (Gaz)', specific: 0.481, color: '#f59e0b' },
  EAF:   { label: 'Scrap-EAF',       specific: 0.072, color: '#10b981' },
  EPD:   { label: 'Kardemir EPD',    specific: 2.29,  color: '#8b5cf6' },
};

// ── Core Calculation Function ─────────────────────────────────────────────────
export function calculateSteelEmissions(
  productionTon: number,
  fuels: FuelInput[],
  electricity: ElectricityInput,
  precursors: PrecursorInput[],
  transport: TransportInput[],
  etsPrice: number = ETS_PRICE_EUR,
): SteelEmissionResult {
  if (productionTon <= 0) throw new Error('Üretim miktarı 0\'dan büyük olmalıdır');

  // 1) Direct fuel emissions: AD × NCV × EF × OxF × (1 - Biomass)
  const directFuel = fuels.reduce((sum, f) =>
    sum + f.amount * f.ncv * f.ef * f.oxidation * (1 - f.biomassShare), 0);

  // 2) Electricity: split or total
  let electricityTco2e = 0;
  let isDefaultUsed = false;
  if (electricity.totalKwh > 0) {
    electricityTco2e = electricity.totalKwh * electricity.avgEf / 1000;
  } else if (electricity.onsiteKwh > 0 || electricity.gridKwh > 0) {
    electricityTco2e = (
      electricity.onsiteKwh * electricity.onsiteEf +
      electricity.gridKwh  * electricity.gridEf
    ) / 1000;
  } else {
    isDefaultUsed = true;
  }

  // 3) Precursors: Amount × EF
  const precursorTotal = precursors.reduce((sum, p) =>
    sum + p.amountTon * p.ef, 0);

  // 4) Transport: Mass × Distance × EF / 1000
  const transportTotal = transport.reduce((sum, t) =>
    sum + t.massTon * t.distanceKm * t.efKgPerTkm / 1000, 0);

  const totalEmbedded = directFuel + electricityTco2e + precursorTotal + transportTotal;
  const specificEmbedded = totalEmbedded / productionTon;

  // Dependent vs Independent
  const dependentEmissions  = electricity.gridKwh * electricity.gridEf / 1000;
  const independentEmissions = directFuel + precursorTotal + (electricity.onsiteKwh * electricity.onsiteEf / 1000);

  // EPD Benchmark
  const epdBenchmarkTotal    = productionTon * EMISSION_FACTORS.epdA1A3;
  const epdBenchmarkSpecific = EMISSION_FACTORS.epdA1A3;
  const diffVsEpd            = specificEmbedded - epdBenchmarkSpecific;
  const status: 'below' | 'above' | 'equal' =
    diffVsEpd > 0.001 ? 'above' : diffVsEpd < -0.001 ? 'below' : 'equal';

  // CBAM Cost
  const certificatesRequired = totalEmbedded;
  const cbamCostEur          = certificatesRequired * etsPrice;

  return {
    directFuel: round4(directFuel),
    electricity: round4(electricityTco2e),
    precursorTotal: round4(precursorTotal),
    transportTotal: round4(transportTotal),
    totalEmbedded: round4(totalEmbedded),
    specificEmbedded: round6(specificEmbedded),
    dependentEmissions: round4(dependentEmissions),
    independentEmissions: round4(independentEmissions),
    epdBenchmarkTotal: round4(epdBenchmarkTotal),
    epdBenchmarkSpecific,
    diffVsEpd: round6(diffVsEpd),
    status,
    calculationMethod: isDefaultUsed ? 'epd_benchmark' : 'actual_data',
    isDefaultUsed,
    cbamCostEur: round2(cbamCostEur),
    certificatesRequired: round4(certificatesRequired),
  };
}

// ── Supplier Simulation ───────────────────────────────────────────────────────
export interface SupplierShare {
  name: string;
  type: 'BOF' | 'EAF' | 'DRI-EAF';
  share: number;     // 0-100 percent
  specificEf: number; // tCO2e/ton
  country: string;
}

export interface SimulationResult {
  weightedEf: number;      // weighted avg tCO2e/ton
  totalEmission: number;   // for given production
  cbamCost: number;        // €
  quarterlyProduction: number;
  comparison?: {
    before: SimulationResult;
    saving: number;
    savingPct: number;
  };
}

export function simulateSupplierMix(
  suppliers: SupplierShare[],
  quarterlyProductionTon: number,
  etsPrice: number = ETS_PRICE_EUR,
): SimulationResult {
  const total = suppliers.reduce((s, x) => s + x.share, 0);
  if (Math.abs(total - 100) > 0.5) throw new Error('Paylar toplamı 100 olmalı');

  const weightedEf = suppliers.reduce((sum, s) =>
    sum + (s.share / 100) * s.specificEf, 0);

  const totalEmission = weightedEf * quarterlyProductionTon;
  const cbamCost = totalEmission * etsPrice;

  return {
    weightedEf: round6(weightedEf),
    totalEmission: round4(totalEmission),
    cbamCost: round2(cbamCost),
    quarterlyProduction: quarterlyProductionTon,
  };
}

// ── AI Recommendation Engine ──────────────────────────────────────────────────
export interface Recommendation {
  id: string;
  category: 'electricity' | 'fuel' | 'transport' | 'supplier' | 'epd' | 'general';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  potentialSavingTco2e?: number;
  potentialSavingEur?: number;
  action: string;
  source: 'DEFRA' | 'EU-CBAM' | 'EPD' | 'Best-Practice';
}

export function generateRecommendations(
  result: SteelEmissionResult,
  production: number,
  suppliers?: SupplierShare[],
): Recommendation[] {
  const recs: Recommendation[] = [];

  // Default value penalty
  if (result.isDefaultUsed || result.calculationMethod !== 'actual_data') {
    recs.push({
      id: 'default-penalty',
      category: 'general',
      severity: 'high',
      title: '⚠️ Varsayılan Değer Kullanılıyor',
      description: 'Gerçek enerji verisi girilmediğinden AB varsayılan değerleri kullanılıyor. Bu, gerçek emisyondan %30-60 daha yüksek maliyet oluşturabilir.',
      potentialSavingEur: result.cbamCostEur * 0.40,
      action: 'Enerji faturaları ve üretim verilerini girin.',
      source: 'EU-CBAM',
    });
  }

  // Above EPD benchmark
  if (result.status === 'above') {
    const excess = result.diffVsEpd * production;
    recs.push({
      id: 'epd-above',
      category: 'general',
      severity: 'high',
      title: '📊 EPD Benchmark Üstünde',
      description: `Spesifik emisyonunuz (${result.specificEmbedded.toFixed(3)} tCO2e/ton) Kardemir EPD benchmark değerinin (2.29) ${result.diffVsEpd.toFixed(3)} üstünde.`,
      potentialSavingTco2e: excess,
      potentialSavingEur: excess * ETS_PRICE_EUR,
      action: 'EPD belgesi alın veya proses verimliliğini artırın.',
      source: 'EPD',
    });
  }

  // High electricity share
  const electricityShare = result.electricity / (result.totalEmbedded || 1);
  if (electricityShare > 0.35) {
    recs.push({
      id: 'solar-opportunity',
      category: 'electricity',
      severity: 'medium',
      title: '☀️ Güneş Enerjisi Fırsatı',
      description: `Elektrik emisyonlarınız toplam emisyonun %${(electricityShare*100).toFixed(0)}'ini oluşturuyor. Çatı güneş paneli ile grid elektriği azaltabilirsiniz.`,
      potentialSavingTco2e: result.electricity * 0.3,
      potentialSavingEur: result.electricity * 0.3 * ETS_PRICE_EUR,
      action: 'Yakın bölgedeki güneş enerjisi imkânlarını değerlendirin.',
      source: 'Best-Practice',
    });
  }

  // High transport
  const transportShare = result.transportTotal / (result.totalEmbedded || 1);
  if (transportShare > 0.05) {
    recs.push({
      id: 'transport-modal',
      category: 'transport',
      severity: 'medium',
      title: '🚂 Demiryolu Taşımacılığı',
      description: `Taşıma emisyonlarınız toplam emisyonun %${(transportShare*100).toFixed(0)}'ini oluşturuyor. Karayolundan demiryoluna geçiş ile %65 azaltım mümkün. (DEFRA EF: Karayolu 0.062 vs Demiryolu 0.022 kgCO2e/t-km)`,
      potentialSavingTco2e: result.transportTotal * 0.5,
      potentialSavingEur: result.transportTotal * 0.5 * ETS_PRICE_EUR,
      action: 'Lojistik sözleşmelerinde demiryolu modunu değerlendirin.',
      source: 'DEFRA',
    });
  }

  // BOF supplier dominance
  if (suppliers) {
    const bofShare = suppliers.filter(s => s.type === 'BOF').reduce((s, x) => s + x.share, 0);
    if (bofShare > 50) {
      const saving = (bofShare / 100) * production * (EMISSION_FACTORS.steelBOF - EMISSION_FACTORS.steelEAF) * 0.3;
      recs.push({
        id: 'supplier-eaf',
        category: 'supplier',
        severity: 'high',
        title: '🏭 EAF Tedarikçiye Geçiş',
        description: `BOF çelik kullanım oranınız %${bofShare.toFixed(0)}. EAF çelik (hurda bazlı) yaklaşık 1.8 tCO2e/ton daha düşük emisyona sahip.`,
        potentialSavingTco2e: saving,
        potentialSavingEur: saving * ETS_PRICE_EUR,
        action: 'EAF üreticilerinden (örn. Çolakoğlu) teklif alın.',
        source: 'EU-CBAM',
      });
    }
  }

  // Fuel optimization
  if (result.directFuel > result.totalEmbedded * 0.3) {
    recs.push({
      id: 'fuel-biogas',
      category: 'fuel',
      severity: 'low',
      title: '🔥 Yakıt Optimizasyonu',
      description: 'Doğalgazı biyogaz ile kısmen ikame ederek doğrudan emisyonları %20-30 azaltabilirsiniz.',
      potentialSavingTco2e: result.directFuel * 0.25,
      potentialSavingEur: result.directFuel * 0.25 * ETS_PRICE_EUR,
      action: 'Biyogaz veya yeşil hidrojen uygulanabilirliğini araştırın.',
      source: 'Best-Practice',
    });
  }

  return recs.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.severity] - { high: 0, medium: 1, low: 2 }[b.severity]));
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function round2(n: number) { return Math.round(n * 100) / 100; }
function round4(n: number) { return Math.round(n * 10000) / 10000; }
function round6(n: number) { return Math.round(n * 1000000) / 1000000; }

export function formatEur(n: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);
}
export function formatNum(n: number, dec = 2): string {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: dec }).format(n);
}
export function formatTCO2(n: number): string {
  return `${formatNum(n, 3)} tCO₂e`;
}

// Default inputs for demo
export const DEFAULT_FUELS: FuelInput[] = [
  { name: 'Doğalgaz', amount: 50000, unit: 'Nm³', ncv: 3.4e-5, ef: 56.1, oxidation: 1, biomassShare: 0 },
  { name: 'Kok Fırını Gazı', amount: 120000, unit: 'Nm³', ncv: 1.7e-5, ef: 44.4, oxidation: 1, biomassShare: 0 },
  { name: 'Yüksek Fırın Gazı', amount: 0, unit: 'Nm³', ncv: 3.3e-6, ef: 260, oxidation: 1, biomassShare: 0 },
];

export const DEFAULT_ELECTRICITY: ElectricityInput = {
  totalKwh: 0,
  onsiteKwh: 600000,
  gridKwh: 400000,
  onsiteEf: 1.8,
  gridEf: 0.91,
  avgEf: 1.45,
};

export const DEFAULT_PRECURSORS: PrecursorInput[] = [
  { name: 'Çelik Billet', amountTon: 1020, ef: 2.1, note: 'Temel precursor' },
  { name: 'Ferroalaşım', amountTon: 0, ef: 0 },
];

export const DEFAULT_TRANSPORT: TransportInput[] = [
  { mode: 'Karayolu', massTon: 1000, distanceKm: 0, efKgPerTkm: EMISSION_FACTORS.road },
  { mode: 'Demiryolu', massTon: 0, distanceKm: 0, efKgPerTkm: EMISSION_FACTORS.rail },
];

export const DEFAULT_SUPPLIERS: SupplierShare[] = [
  { name: 'Erdemir', type: 'BOF', share: 70, specificEf: EMISSION_FACTORS.steelBOF, country: 'TR' },
  { name: 'Çolakoğlu', type: 'EAF', share: 30, specificEf: EMISSION_FACTORS.steelEAF, country: 'TR' },
];
