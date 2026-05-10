import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/layout/PageContainer'
import { calculateSteel } from '../api/cbamApi'
import { DEMO_CALCULATION_INPUT } from '../utils/mockData'
import { ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react'

const STEPS = ['Firma Bilgileri', 'Ürün Bilgileri', 'Yakıt Verileri', 'Elektrik', 'Precursor', 'Taşıma', 'Sonuçlar']

function StepIndicator({ current, total }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700,
            background: i < current ? 'var(--color-primary)' : i === current ? 'var(--color-primary)' : '#E2E8F0',
            color: i <= current ? '#fff' : 'var(--color-text-muted)',
          }}>
            {i < current ? <CheckCircle size={14} /> : i + 1}
          </div>
          {i < total - 1 && (
            <div style={{ width: 32, height: 2, background: i < current ? 'var(--color-primary)' : '#E2E8F0', borderRadius: 1 }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function SteelCalculation() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(DEMO_CALCULATION_INPUT)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function update(path, value) {
    setForm(prev => {
      const clone = JSON.parse(JSON.stringify(prev))
      const parts = path.split('.')
      let obj = clone
      for (let i = 0; i < parts.length - 1; i++) obj = obj[parts[i]]
      obj[parts[parts.length - 1]] = value
      return clone
    })
  }

  async function handleCalculate() {
    setLoading(true)
    setError('')
    try {
      const res = await calculateSteel(form)
      setResult(res)
      setStep(6)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = { marginBottom: 12 }

  return (
    <PageContainer title="Veri Girişi & Hesaplama" subtitle="Çok adımlı CBAM emisyon hesaplama formu">
      <div style={{ maxWidth: 760 }}>
        <StepIndicator current={step} total={STEPS.length} />

        <div className="card" style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--color-primary)' }}>
            Adım {step + 1}: {STEPS[step]}
          </h2>

          {/* Step 0: Company Info */}
          {step === 0 && (
            <div className="grid-2">
              {[
                ['Firma Adı *', 'company_name', 'text'],
                ['Ülke', 'country', 'text'],
                ['Tesis Adı', 'facility_name', 'text'],
                ['Raporlama Dönemi', 'reporting_period', 'text'],
              ].map(([label, field, type]) => (
                <div key={field} className="form-group">
                  <label>{label}</label>
                  <input type={type} value={form[field] || ''} onChange={e => update(field, e.target.value)} />
                </div>
              ))}
            </div>
          )}

          {/* Step 1: Product Info */}
          {step === 1 && (
            <div className="grid-2">
              {[
                ['Ürün Adı *', 'product_name'],
                ['CN Kodu *', 'cn_code'],
                ['Üretim Rotası', 'production_route'],
              ].map(([label, field]) => (
                <div key={field} className="form-group">
                  <label>{label}</label>
                  <input value={form[field] || ''} onChange={e => update(field, e.target.value)} />
                </div>
              ))}
              <div className="form-group">
                <label>Üretim Miktarı (ton) *</label>
                <input type="number" min="0" value={form.production_amount_ton || ''} onChange={e => update('production_amount_ton', parseFloat(e.target.value))} />
              </div>
            </div>
          )}

          {/* Step 2: Fuel */}
          {step === 2 && (
            <div>
              {form.fuels.map((fuel, i) => (
                <div key={i} style={{ padding: 16, border: '1px solid var(--color-border)', borderRadius: 8, marginBottom: 16 }}>
                  <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>Yakıt {i + 1}</p>
                  <div className="grid-2">
                    {[
                      ['Yakıt Adı', `fuels.${i}.fuel_name`, 'text'],
                      ['Miktar', `fuels.${i}.amount`, 'number'],
                      ['NCV (TJ/birim)', `fuels.${i}.ncv_tj_per_unit`, 'number'],
                      ['Emisyon Faktörü (tCO₂e/TJ)', `fuels.${i}.emission_factor_tco2e_per_tj`, 'number'],
                      ['Oksidasyon Faktörü', `fuels.${i}.oxidation_factor`, 'number'],
                      ['Biyokütle Payı', `fuels.${i}.biomass_share`, 'number'],
                    ].map(([label, path, type]) => {
                      const parts = path.split('.')
                      const val = parts.reduce((o, k) => o?.[k], form)
                      return (
                        <div key={path} className="form-group">
                          <label>{label}</label>
                          <input type={type} value={val ?? ''} onChange={e => update(path, type === 'number' ? parseFloat(e.target.value) : e.target.value)} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Electricity */}
          {step === 3 && (
            <div>
              <div className="form-group">
                <label>Hesaplama Tipi</label>
                <select value={form.electricity?.calculation_type || 'split'} onChange={e => update('electricity.calculation_type', e.target.value)}>
                  <option value="split">Split (onsite / grid ayrı)</option>
                  <option value="average">Average (ortalama)</option>
                </select>
              </div>
              <div className="grid-2">
                {[
                  ['Onsite kWh', 'electricity.onsite_kwh'],
                  ['Grid kWh', 'electricity.grid_kwh'],
                  ['Onsite EF (kgCO₂e/kWh)', 'electricity.onsite_ef'],
                  ['Grid EF (kgCO₂e/kWh)', 'electricity.grid_ef'],
                  ['Average EF', 'electricity.average_ef'],
                ].map(([label, path]) => {
                  const val = path.split('.').reduce((o, k) => o?.[k], form)
                  return (
                    <div key={path} className="form-group">
                      <label>{label}</label>
                      <input type="number" value={val ?? ''} onChange={e => update(path, parseFloat(e.target.value))} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 4: Precursor */}
          {step === 4 && (
            <div>
              {form.precursors.map((p, i) => (
                <div key={i} style={{ padding: 16, border: '1px solid var(--color-border)', borderRadius: 8, marginBottom: 16 }}>
                  <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>Hammadde {i + 1}</p>
                  <div className="grid-2">
                    {[
                      ['Hammadde Adı', `precursors.${i}.material_name`, 'text'],
                      ['Miktar (ton)', `precursors.${i}.amount_ton`, 'number'],
                      ['Emisyon Faktörü (tCO₂e/ton)', `precursors.${i}.emission_factor_tco2e_per_ton`, 'number'],
                      ['Tedarikçi Adı', `precursors.${i}.supplier_name`, 'text'],
                    ].map(([label, path, type]) => {
                      const val = path.split('.').reduce((o, k) => o?.[k], form)
                      return (
                        <div key={path} className="form-group">
                          <label>{label}</label>
                          <input type={type} value={val ?? ''} onChange={e => update(path, type === 'number' ? parseFloat(e.target.value) : e.target.value)} />
                        </div>
                      )
                    })}
                    <div className="form-group">
                      <label>EPD Belgesi Var mı?</label>
                      <select value={form.precursors[i].has_epd} onChange={e => update(`precursors.${i}.has_epd`, e.target.value === 'true')}>
                        <option value="false">Hayır</option>
                        <option value="true">Evet</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 5: Transport */}
          {step === 5 && (
            <div>
              <div className="form-group">
                <label>Taşıma Aktif mi?</label>
                <select value={form.transport?.active} onChange={e => update('transport.active', e.target.value === 'true')}>
                  <option value="true">Evet</option>
                  <option value="false">Hayır</option>
                </select>
              </div>
              {form.transport?.active && (
                <div className="grid-2">
                  {[
                    ['Kütle (ton)', 'transport.mass_ton'],
                    ['Mesafe (km)', 'transport.distance_km'],
                    ['EF (kgCO₂e/ton-km)', 'transport.emission_factor_kgco2e_per_ton_km'],
                  ].map(([label, path]) => {
                    const val = path.split('.').reduce((o, k) => o?.[k], form)
                    return (
                      <div key={path} className="form-group">
                        <label>{label}</label>
                        <input type="number" value={val ?? ''} onChange={e => update(path, parseFloat(e.target.value))} />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Step 6: Results */}
          {step === 6 && result && (
            <div>
              <div className="alert alert-success" style={{ marginBottom: 16 }}>
                ✅ Hesaplama tamamlandı. Aşağıda sonuçları görüntüleyebilirsiniz.
              </div>
              <div className="grid-2">
                {[
                  ['Toplam Emisyon', `${result.breakdown.total_emission_tco2e.toLocaleString('tr-TR')} tCO₂e`],
                  ['Ürün Başına', `${result.breakdown.specific_emission_tco2e_per_ton.toFixed(2)} tCO₂e/ton`],
                  ['EPD Fark', `${result.difference_percent > 0 ? '+' : ''}${result.difference_percent.toFixed(1)}%`],
                  ['Risk Seviyesi', result.risk_level.toUpperCase()],
                  ['Hesaplama Modu', result.calculation_mode],
                  ['Veri Kalite Skoru', `${result.data_quality_score} / 100`],
                  ['Yakıt Emisyonu', `${result.breakdown.fuel_emission_tco2e.toFixed(1)} tCO₂e`],
                  ['Elektrik Emisyonu', `${result.breakdown.electricity_emission_tco2e.toFixed(1)} tCO₂e`],
                  ['Precursor Emisyonu', `${result.breakdown.precursor_emission_tco2e.toFixed(1)} tCO₂e`],
                  ['Taşıma Emisyonu', `${result.breakdown.transport_emission_tco2e.toFixed(1)} tCO₂e`],
                ].map(([k, v]) => (
                  <div key={k} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                    <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{k}</p>
                    <p style={{ fontSize: 14, fontWeight: 700 }}>{v}</p>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 20 }}>
                <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                  Dashboard'da Görüntüle
                </button>
              </div>
            </div>
          )}

          {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn btn-outline" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0 || step === 6}>
            <ChevronLeft size={16} /> Geri
          </button>
          {step < 5 ? (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>
              İleri <ChevronRight size={16} />
            </button>
          ) : step === 5 ? (
            <button className="btn btn-primary" onClick={handleCalculate} disabled={loading}>
              {loading ? 'Hesaplanıyor...' : '🧮 Hesapla'}
            </button>
          ) : null}
        </div>
      </div>
    </PageContainer>
  )
}
