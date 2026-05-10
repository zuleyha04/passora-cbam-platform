/**
 * POST /api/calculate
 * Server-side CBAM hesaplama + Supabase'e otomatik kayıt
 * Body: { production, fuels, electricity, precursors, transport, etsPrice, company, period }
 */
import { db } from './_db';
import { ok, err, preflight, parseBody, type VercelRequest, type VercelResponse } from './_helpers';

// ── Emission Factors (IPCC 2006 / AB MRR) ────────────────────
const EF = {
  TURKEY_GRID_EF: 0.4437,   // tCO2e/MWh — TEIAS 2024
  EPD_BENCHMARK:  2.29,     // tCO2e/ton — Kardemir EPD A1-A3
  DEFAULT_STEEL_EF: 2.35,   // tCO2e/ton — AB CBAM BF-BOF default
  DEFRA_ROAD: 0.062, DEFRA_RAIL: 0.022, DEFRA_SEA: 0.011, DEFRA_AIR: 1.020,
};

interface FuelInput {
  name: string; amount: number; ncv: number; ef: number;
  oxidation: number; biomassShare: number;
}
interface ElecInput {
  totalKwh: number; avgEf: number;
  onsiteKwh: number; onsiteEf: number; gridKwh: number; gridEf: number;
}
interface PrecursorInput { amountTon: number; ef: number; }
interface TransportInput { mode: string; massTon: number; distanceKm: number; efKgPerTkm: number; }
interface CalcRequest {
  production: number;
  fuels: FuelInput[];
  electricity: ElecInput;
  precursors: PrecursorInput[];
  transport: TransportInput[];
  etsPrice: number;
  company: { name: string; taxNo: string; city: string; sector: string };
  period: string;
  saveToDb?: boolean;
}

function calcFuel(fuels: FuelInput[]): number {
  return fuels.reduce((sum, f) =>
    sum + f.amount * f.ncv * f.ef * f.oxidation * (1 - f.biomassShare), 0);
}

function calcElec(e: ElecInput): { total: number; grid: number; onsite: number } {
  if (e.totalKwh > 0) {
    const total  = e.totalKwh * e.avgEf / 1000;
    const grid   = e.totalKwh * EF.TURKEY_GRID_EF / 1000;
    return { total, grid, onsite: total - grid };
  }
  const onsite = e.onsiteKwh * e.onsiteEf / 1000;
  const grid   = e.gridKwh   * e.gridEf   / 1000;
  return { total: onsite + grid, grid, onsite };
}

function calcPrecursor(ps: PrecursorInput[]): number {
  return ps.reduce((s, p) => s + p.amountTon * p.ef, 0);
}

function calcTransport(ts: TransportInput[]): number {
  return ts.reduce((s, t) => s + t.massTon * t.distanceKm * t.efKgPerTkm / 1000, 0);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return preflight(res);
  if (req.method !== 'POST') return err(res, 'Method Not Allowed', 405);

  const body = parseBody<CalcRequest>(req);

  const { production, fuels = [], electricity, precursors = [], transport = [],
          etsPrice = 75.36, company, period, saveToDb = false } = body;

  if (!production || production <= 0) return err(res, 'Geçerli bir üretim miktarı giriniz', 400);

  // ── Calculate ─────────────────────────────────────────────
  const directFuel     = calcFuel(fuels);
  const elec           = calcElec(electricity ?? { totalKwh:0, avgEf:0, onsiteKwh:0, onsiteEf:0, gridKwh:0, gridEf:0 });
  const precursorTotal = calcPrecursor(precursors);
  const transportTotal = calcTransport(transport);

  const hasRealData = directFuel > 0 || elec.total > 0 || precursorTotal > 0;
  const isDefaultUsed = !hasRealData;

  const totalEmbedded    = hasRealData
    ? directFuel + elec.total + precursorTotal + transportTotal
    : EF.DEFAULT_STEEL_EF * production;

  const specificEmbedded    = totalEmbedded / production;
  const certificatesRequired = totalEmbedded;
  const cbamCostEur          = certificatesRequired * etsPrice;
  const diffVsEpd            = specificEmbedded - EF.EPD_BENCHMARK;
  const status               = diffVsEpd > 0.0001 ? 'above' : diffVsEpd < -0.0001 ? 'below' : 'equal';

  const result = {
    directFuel,
    electricity: elec.total,
    dependentEmissions: elec.grid,
    independentEmissions: directFuel + elec.onsite + precursorTotal,
    precursorTotal,
    transportTotal,
    totalEmbedded,
    specificEmbedded,
    certificatesRequired,
    cbamCostEur,
    epdBenchmarkSpecific: EF.EPD_BENCHMARK,
    diffVsEpd,
    status,
    isDefaultUsed,
    calculationMethod: hasRealData ? 'actual_data' : 'default_value',
  };

  // ── Optional: save to DB ──────────────────────────────────
  let savedId: string | null = null;
  if (saveToDb && company && period) {
    const { data, error: dbErr } = await db.from('calculations').insert({
      company_name: company.name,
      tax_no:       company.taxNo,
      city:         company.city,
      period,
      production_ton:      production,
      direct_fuel_tco2:    directFuel,
      electricity_tco2:    elec.total,
      precursor_tco2:      precursorTotal,
      transport_tco2:      transportTotal,
      total_embedded_tco2: totalEmbedded,
      specific_embedded:   specificEmbedded,
      cbam_cost_eur:       cbamCostEur,
      ets_price:           etsPrice,
      calculation_method:  result.calculationMethod,
      is_default_used:     isDefaultUsed,
      epd_benchmark:       EF.EPD_BENCHMARK,
      diff_vs_epd:         diffVsEpd,
      status,
      input_data: { fuels, electricity, precursors, transport },
    }).select('id').single();

    if (!dbErr && data) savedId = (data as { id: string }).id;
  }

  return ok(res, { ...result, savedId });
}
