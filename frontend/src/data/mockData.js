// Passora - Merkezi Mock Data (Harita destekli)

export const MOCK_COMPANIES = [
  {
    id: 'c1',
    name: 'Örnek Demir Çelik A.Ş.',
    sector: 'Entegre Demir-Çelik',
    product_count: 3,
    total_emission: 9455,
    avg_dq_score: 77,
    risk_level: 'critical',
    cbam_status: 'Onay Bekliyor',
    last_calculation: '10.05.2026',
  },
  {
    id: 'c2',
    name: 'Anadolu Steel Ltd.',
    sector: 'Elektrik Ark Fırını',
    product_count: 3,
    total_emission: 7043,
    avg_dq_score: 78,
    risk_level: 'high',
    cbam_status: 'Veri Toplanıyor',
    last_calculation: '08.05.2026',
  },
  {
    id: 'c3',
    name: 'Karadeniz Profil A.Ş.',
    sector: 'Uzun Çelik Profil',
    product_count: 2,
    total_emission: 2234,
    avg_dq_score: 73,
    risk_level: 'low',
    cbam_status: 'Hesaplama Tamamlandı',
    last_calculation: '06.05.2026',
  },
]

export const MOCK_REPORTS = [
  {
    id: 'r1', company_id: 'c1', company_name: 'Örnek Demir Çelik A.Ş.',
    product_name: 'Çelik Profil', cn_code: '7216', production_route: 'BF-BOF',
    production_amount_ton: 1000, calculation_mode: 'actual_data',
    total_emission_tco2e: 3724.5, specific_emission_tco2e_per_ton: 3.72,
    epd_benchmark_tco2e_per_ton: 2.29, difference_percent: 62.5,
    risk_level: 'critical', data_quality_score: 82,
    fuel_emission_tco2e: 378.5, electricity_emission_tco2e: 1164.0,
    precursor_emission_tco2e: 2142.0, transport_emission_tco2e: 15.5,
    report_date: '2026-05-10', missing_fields: [],
  },
  {
    id: 'r2', company_id: 'c2', company_name: 'Anadolu Steel Ltd.',
    product_name: 'İnşaat Demiri', cn_code: '7214', production_route: 'EAF',
    production_amount_ton: 800, calculation_mode: 'hybrid',
    total_emission_tco2e: 1984.0, specific_emission_tco2e_per_ton: 2.48,
    epd_benchmark_tco2e_per_ton: 2.29, difference_percent: 8.3,
    risk_level: 'medium', data_quality_score: 71,
    fuel_emission_tco2e: 112.0, electricity_emission_tco2e: 820.0,
    precursor_emission_tco2e: 1024.0, transport_emission_tco2e: 28.0,
    report_date: '2026-05-08', missing_fields: ['transport_distance'],
  },
  {
    id: 'r3', company_id: 'c3', company_name: 'Karadeniz Profil A.Ş.',
    product_name: 'Tel Çubuk', cn_code: '7213', production_route: 'EAF',
    production_amount_ton: 600, calculation_mode: 'epd_benchmark',
    total_emission_tco2e: 1374.0, specific_emission_tco2e_per_ton: 2.29,
    epd_benchmark_tco2e_per_ton: 2.29, difference_percent: 0.0,
    risk_level: 'low', data_quality_score: 55,
    fuel_emission_tco2e: 0, electricity_emission_tco2e: 0,
    precursor_emission_tco2e: 1374.0, transport_emission_tco2e: 0,
    report_date: '2026-05-06', missing_fields: ['electricity_consumption', 'fuel_data'],
  },
  {
    id: 'r4', company_id: 'c1', company_name: 'Örnek Demir Çelik A.Ş.',
    product_name: 'Çelik Profil', cn_code: '7216', production_route: 'BF-BOF',
    production_amount_ton: 950, calculation_mode: 'actual_data',
    total_emission_tco2e: 3680.0, specific_emission_tco2e_per_ton: 3.87,
    epd_benchmark_tco2e_per_ton: 2.29, difference_percent: 69.0,
    risk_level: 'critical', data_quality_score: 88,
    fuel_emission_tco2e: 395.0, electricity_emission_tco2e: 1140.0,
    precursor_emission_tco2e: 2120.0, transport_emission_tco2e: 25.0,
    report_date: '2026-04-28', missing_fields: [],
  },
  {
    id: 'r5', company_id: 'c2', company_name: 'Anadolu Steel Ltd.',
    product_name: 'Sıcak Hadde Rulo', cn_code: '7208', production_route: 'BF-BOF',
    production_amount_ton: 1200, calculation_mode: 'hybrid',
    total_emission_tco2e: 3540.0, specific_emission_tco2e_per_ton: 2.95,
    epd_benchmark_tco2e_per_ton: 2.29, difference_percent: 28.8,
    risk_level: 'high', data_quality_score: 68,
    fuel_emission_tco2e: 520.0, electricity_emission_tco2e: 980.0,
    precursor_emission_tco2e: 1980.0, transport_emission_tco2e: 60.0,
    report_date: '2026-04-20', missing_fields: ['precursor_epd'],
  },
  {
    id: 'r6', company_id: 'c3', company_name: 'Karadeniz Profil A.Ş.',
    product_name: 'Çelik Köşebent', cn_code: '7216', production_route: 'EAF',
    production_amount_ton: 400, calculation_mode: 'actual_data',
    total_emission_tco2e: 860.0, specific_emission_tco2e_per_ton: 2.15,
    epd_benchmark_tco2e_per_ton: 2.29, difference_percent: -6.1,
    risk_level: 'low', data_quality_score: 91,
    fuel_emission_tco2e: 48.0, electricity_emission_tco2e: 420.0,
    precursor_emission_tco2e: 380.0, transport_emission_tco2e: 12.0,
    report_date: '2026-04-15', missing_fields: [],
  },
  {
    id: 'r7', company_id: 'c1', company_name: 'Örnek Demir Çelik A.Ş.',
    product_name: 'Yapısal Çelik', cn_code: '7216', production_route: 'BF-BOF',
    production_amount_ton: 500, calculation_mode: 'hybrid',
    total_emission_tco2e: 2050.0, specific_emission_tco2e_per_ton: 4.10,
    epd_benchmark_tco2e_per_ton: 2.29, difference_percent: 79.0,
    risk_level: 'critical', data_quality_score: 60,
    fuel_emission_tco2e: 220.0, electricity_emission_tco2e: 640.0,
    precursor_emission_tco2e: 1160.0, transport_emission_tco2e: 30.0,
    report_date: '2026-04-10', missing_fields: ['precursor_epd', 'transport_ef'],
  },
  {
    id: 'r8', company_id: 'c2', company_name: 'Anadolu Steel Ltd.',
    product_name: 'İnşaat Demiri', cn_code: '7214', production_route: 'EAF',
    production_amount_ton: 700, calculation_mode: 'actual_data',
    total_emission_tco2e: 1519.0, specific_emission_tco2e_per_ton: 2.17,
    epd_benchmark_tco2e_per_ton: 2.29, difference_percent: -5.2,
    risk_level: 'low', data_quality_score: 94,
    fuel_emission_tco2e: 89.0, electricity_emission_tco2e: 630.0,
    precursor_emission_tco2e: 784.0, transport_emission_tco2e: 16.0,
    report_date: '2026-04-05', missing_fields: [],
  },
]

export const MOCK_SUPPLIERS = [
  { id: 's0', name: 'Mevcut Tedarikçi', material: 'Billet (Kütük)', emission_factor_tco2e_per_ton: 2.10, price_per_ton: 500, has_epd: false, amount_ton: 1020, is_current: true },
  { id: 's1', name: 'Tedarikçi A',      material: 'Billet (Kütük)', emission_factor_tco2e_per_ton: 1.85, price_per_ton: 520, has_epd: true,  amount_ton: 1020, is_current: false },
  { id: 's2', name: 'Tedarikçi B',      material: 'Billet (Kütük)', emission_factor_tco2e_per_ton: 1.55, price_per_ton: 560, has_epd: true,  amount_ton: 1020, is_current: false },
  { id: 's3', name: 'Tedarikçi C',      material: 'Billet (Kütük)', emission_factor_tco2e_per_ton: 2.40, price_per_ton: 480, has_epd: false, amount_ton: 1020, is_current: false },
]

export const MOCK_CRITICAL_ACTIONS = [
  { id: 'a1', company: 'Örnek Demir Çelik A.Ş.', type: 'Kritik Risk',        desc: 'Emisyon referans değerinin %62 üzerinde. Rapor acilen incelenmeli.', priority: 'critical', action: 'Raporu İncele', report_id: 'r1' },
  { id: 'a2', company: 'Anadolu Steel Ltd.',      type: 'Eksik Veri',         desc: 'Veri kalite skoru 71/100. Nakliye mesafesi ve EPD bilgisi eksik.',    priority: 'high',     action: 'Veriyi Tamamlat', report_id: 'r2' },
  { id: 'a3', company: 'Anadolu Steel Ltd.',      type: 'Karma Hesaplama',    desc: 'Hybrid mod kullanılmış. Gerçek tesis verisi talep edilmeli.',          priority: 'medium',   action: 'Veri Talep Et', report_id: 'r5' },
  { id: 'a4', company: 'Karadeniz Profil A.Ş.',  type: 'Düşük Veri Kalitesi',desc: 'Veri kalite skoru 55/100. Elektrik ve yakıt verisi girilmemiş.',       priority: 'high',     action: 'Raporu İncele', report_id: 'r3' },
]

export function getAdminSummary() {
  const total = MOCK_REPORTS.length
  const critical = MOCK_REPORTS.filter(r => r.risk_level === 'critical').length
  const avgDQ = Math.round(MOCK_REPORTS.reduce((s, r) => s + r.data_quality_score, 0) / total)
  const totalEmission = Math.round(MOCK_REPORTS.reduce((s, r) => s + r.total_emission_tco2e, 0))
  const missingRate = Math.round(MOCK_REPORTS.reduce((s, r) => s + r.missing_fields.length, 0) / total * 10)

  const byCompany = {}
  MOCK_REPORTS.forEach(r => {
    byCompany[r.company_name] = (byCompany[r.company_name] || 0) + r.total_emission_tco2e
  })

  // Firma bazlı harita verisi
  const mapData = MOCK_COMPANIES.map(c => {
    const reps = MOCK_REPORTS.filter(r => r.company_id === c.id)
    const emission = Math.round(reps.reduce((s, r) => s + r.total_emission_tco2e, 0))
    const risks = ['critical', 'high', 'medium', 'low']
    const topRisk = risks.find(r => reps.some(rep => rep.risk_level === r)) || 'low'
    return { ...c, total_emission: emission, risk_level: topRisk, report_count: reps.length }
  })

  return {
    total_companies: MOCK_COMPANIES.length,
    total_calculations: total,
    critical_risk_count: critical,
    missing_data_rate: missingRate,
    avg_dq_score: avgDQ,
    total_emission: totalEmission,
    emission_by_company: Object.entries(byCompany).map(([name, value]) => ({
      name: name.split(' ').slice(0, 2).join(' '),
      value: Math.round(value),
    })),
    map_data: [
  {
    city: 'Ereğli',
    emission: 9455,
    risk: 'kritik',
  },
  {
    city: 'Trabzon',
    emission: 2234,
    risk: 'düşük',
  },
  {
    city: 'İskenderun',
    emission: 7043,
    risk: 'yüksek',
  },
]
  }
}

export function getCompanySummaries() {
  return MOCK_COMPANIES.map(c => {
    const reps = MOCK_REPORTS.filter(r => r.company_id === c.id)
    const totalEmission = reps.reduce((s, r) => s + r.total_emission_tco2e, 0)
    const avgDQ = reps.length ? Math.round(reps.reduce((s, r) => s + r.data_quality_score, 0) / reps.length) : 0
    const risks = ['critical', 'high', 'medium', 'low']
    const topRisk = risks.find(r => reps.some(rep => rep.risk_level === r)) || 'low'
    const lastDate = [...reps].sort((a, b) => new Date(b.report_date) - new Date(a.report_date))[0]?.report_date
    return { ...c, product_count: reps.length, total_emission: Math.round(totalEmission), avg_dq_score: avgDQ, top_risk: topRisk, last_report_date: lastDate }
  })
}
