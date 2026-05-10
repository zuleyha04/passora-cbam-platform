-- ============================================================
-- PASSORA CBAM Platform — Supabase PostgreSQL Schema
-- Çalıştır: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Enable UUID
create extension if not exists "pgcrypto";

-- ── Calculations ─────────────────────────────────────────────
create table if not exists calculations (
  id                   uuid primary key default gen_random_uuid(),
  company_name         text not null,
  tax_no               text,
  city                 text,
  period               text not null,                      -- e.g. "2026-Q1"
  production_ton       numeric(12,4) not null,
  direct_fuel_tco2     numeric(14,6) default 0,
  electricity_tco2     numeric(14,6) default 0,
  precursor_tco2       numeric(14,6) default 0,
  transport_tco2       numeric(14,6) default 0,
  total_embedded_tco2  numeric(14,6) not null,
  specific_embedded    numeric(18,10) not null,
  cbam_cost_eur        numeric(14,2) not null,
  ets_price            numeric(8,2) default 75.36,
  calculation_method   text default 'default_value',       -- 'actual_data' | 'default_value'
  is_default_used      boolean default true,
  epd_benchmark        numeric(10,6) default 2.29,
  diff_vs_epd          numeric(14,8),
  status               text check (status in ('above','below','equal')),
  input_data           jsonb,                              -- full raw inputs for audit
  created_at           timestamptz default now()
);

-- ── Suppliers ─────────────────────────────────────────────────
create table if not exists suppliers (
  id           uuid primary key default gen_random_uuid(),
  company_name text not null,
  name         text not null,
  type         text check (type in ('BOF','EAF','DRI-EAF')) default 'EAF',
  country      text default 'TR',
  share        numeric(5,2) default 0,
  specific_ef  numeric(8,4) default 1.89,
  created_at   timestamptz default now()
);

-- ── Emission Factors ─────────────────────────────────────────
create table if not exists emission_factors (
  id            uuid primary key default gen_random_uuid(),
  material_type text not null,     -- 'steel_bof' | 'steel_eaf' | 'natural_gas' | ...
  source        text not null,     -- 'IPCC 2006' | 'DEFRA 2025' | 'TEIAS 2024' | ...
  factor_value  numeric(14,8) not null,
  unit          text not null,     -- 'tCO2e/ton' | 'kgCO2e/kWh' | 'kgCO2e/t-km' | ...
  valid_from    date not null default current_date,
  valid_to      date,
  is_default    boolean default true,
  created_at    timestamptz default now()
);

-- ── Seed: Default Emission Factors ───────────────────────────
insert into emission_factors (material_type, source, factor_value, unit, valid_from, is_default) values
  ('steel_bof',      'AB CBAM Default 2026',  2.35,      'tCO2e/ton',     '2026-01-01', true),
  ('steel_eaf',      'AB CBAM Default 2026',  0.44,      'tCO2e/ton',     '2026-01-01', true),
  ('steel_dri_eaf',  'AB CBAM Default 2026',  1.68,      'tCO2e/ton',     '2026-01-01', true),
  ('steel_epd_a1a3', 'Kardemir EPD 2024',     2.29,      'tCO2e/ton',     '2024-01-01', true),
  ('natural_gas',    'IPCC 2006',             56.1,      'tCO2e/TJ',      '2006-01-01', true),
  ('coal_coking',    'IPCC 2006',             94.6,      'tCO2e/TJ',      '2006-01-01', true),
  ('grid_turkey',    'TEIAS 2024',            0.4437,    'tCO2e/MWh',     '2024-01-01', true),
  ('transport_road', 'DEFRA 2025',            0.062,     'kgCO2e/t-km',   '2025-01-01', true),
  ('transport_rail', 'DEFRA 2025',            0.022,     'kgCO2e/t-km',   '2025-01-01', true),
  ('transport_sea',  'DEFRA 2025',            0.011,     'kgCO2e/t-km',   '2025-01-01', true),
  ('transport_air',  'DEFRA 2025',            1.020,     'kgCO2e/t-km',   '2025-01-01', true)
on conflict do nothing;

-- ── Row Level Security (RLS) ──────────────────────────────────
-- Dev modunda tüm erişim açık — canlıya geçerken auth ekle
alter table calculations   enable row level security;
alter table suppliers      enable row level security;
alter table emission_factors enable row level security;

-- Anon okuma/yazma (demo için)
create policy "anon_all_calculations"    on calculations    for all using (true) with check (true);
create policy "anon_all_suppliers"       on suppliers       for all using (true) with check (true);
create policy "anon_read_ef"             on emission_factors for select using (true);

-- ── Indexes ───────────────────────────────────────────────────
create index if not exists idx_calculations_company on calculations(company_name);
create index if not exists idx_calculations_period  on calculations(period);
create index if not exists idx_suppliers_company    on suppliers(company_name);

-- ── Views ─────────────────────────────────────────────────────
create or replace view calculation_summary as
select
  company_name,
  period,
  count(*)                       as record_count,
  avg(specific_embedded)         as avg_specific_ef,
  sum(cbam_cost_eur)             as total_cbam_cost,
  max(created_at)                as last_updated
from calculations
group by company_name, period
order by max(created_at) desc;
