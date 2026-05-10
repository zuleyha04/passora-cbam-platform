// ============================================================
// Supabase Client
// Tablo şeması: companies, calculations, suppliers, emission_factors
// ============================================================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  || 'https://placeholder.supabase.co';
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnon);

// ── Database Types (mirrors schema.sql) ──────────────────────
export interface DbCalculation {
  id: string;
  company_name: string;
  tax_no: string;
  city: string;
  period: string;
  production_ton: number;
  direct_fuel_tco2: number;
  electricity_tco2: number;
  precursor_tco2: number;
  transport_tco2: number;
  total_embedded_tco2: number;
  specific_embedded: number;
  cbam_cost_eur: number;
  ets_price: number;
  calculation_method: string;
  is_default_used: boolean;
  epd_benchmark: number;
  diff_vs_epd: number;
  status: 'above' | 'below' | 'equal';
  input_data: object;        // JSONB — full inputs
  created_at?: string;
}

export interface DbSupplier {
  id: string;
  company_name: string;
  name: string;
  type: 'BOF' | 'EAF' | 'DRI-EAF';
  country: string;
  share: number;
  specific_ef: number;
  created_at?: string;
}

export interface DbEmissionFactor {
  id: string;
  material_type: string;
  source: string;
  factor_value: number;
  unit: string;
  valid_from: string;
  valid_to: string | null;
  is_default: boolean;
  created_at?: string;
}
