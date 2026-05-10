export const DEMO_CALCULATION_INPUT = {
  company_name: 'Örnek Demir Çelik A.Ş.',
  country: 'Türkiye',
  facility_name: 'Ereğli Tesisi',
  reporting_period: '2025-Q1',
  product_name: 'Steel Profile',
  cn_code: '7216',
  production_route: 'BF-BOF',
  production_amount_ton: 1000,
  fuels: [
    { fuel_name: 'Doğalgaz', amount: 50000, ncv_tj_per_unit: 0.000034, emission_factor_tco2e_per_tj: 56.1, oxidation_factor: 0.99, biomass_share: 0.0 },
    { fuel_name: 'Kok Gazı', amount: 120000, ncv_tj_per_unit: 0.000017, emission_factor_tco2e_per_tj: 44.4, oxidation_factor: 0.99, biomass_share: 0.0 },
  ],
  electricity: {
    calculation_type: 'split',
    onsite_kwh: 600000,
    grid_kwh: 400000,
    total_kwh: 1000000,
    onsite_ef: 1.80,
    grid_ef: 0.91,
    average_ef: 1.45,
  },
  precursors: [
    { material_name: 'Billet', amount_ton: 1020, emission_factor_tco2e_per_ton: 2.10, supplier_name: 'Current Supplier', has_epd: false },
  ],
  transport: {
    active: true,
    mass_ton: 1000,
    distance_km: 250,
    emission_factor_kgco2e_per_ton_km: 0.062,
  },
}

export const DEMO_SUPPLIERS = [
  { id: 's0', name: 'Current Supplier', material: 'Billet', emission_factor_tco2e_per_ton: 2.10, price_per_ton: 500, has_epd: false, amount_ton: 1020, is_current: true },
  { id: 's1', name: 'Supplier A',       material: 'Billet', emission_factor_tco2e_per_ton: 1.85, price_per_ton: 520, has_epd: true,  amount_ton: 1020, is_current: false },
  { id: 's2', name: 'Supplier B',       material: 'Billet', emission_factor_tco2e_per_ton: 1.55, price_per_ton: 560, has_epd: true,  amount_ton: 1020, is_current: false },
  { id: 's3', name: 'Supplier C',       material: 'Billet', emission_factor_tco2e_per_ton: 2.40, price_per_ton: 480, has_epd: false, amount_ton: 1020, is_current: false },
]
