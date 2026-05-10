import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthContext'
import PageContainer from '../components/layout/PageContainer'
import { getReports } from '../api/cbamApi'
import { fmtNum, fmtDate } from '../utils/formatters'
import { getRiskConfig } from '../utils/riskHelpers'
import { Download, Copy } from 'lucide-react'

export default function Reports() {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const companyId = user?.company_id || null
    getReports(companyId).then(r => {
      setReports(r)
      if (r.length > 0) setSelected(r[0])
    }).catch(console.error).finally(() => setLoading(false))
  }, [user])

  function copyJSON() {
    navigator.clipboard.writeText(JSON.stringify(selected, null, 2))
    alert('Rapor JSON kopyalandı.')
  }

  return (
    <PageContainer title="Raporlar" subtitle="Hesaplama raporlarını görüntüleyin ve dışa aktarın">
      {loading && <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Yükleniyor...</p>}

      {!loading && reports.length > 0 && (
        <div style={{ display: 'flex', gap: 20 }}>
          {/* List */}
          <div style={{ width: 280, flexShrink: 0 }}>
            {reports.map(r => {
              const cfg = getRiskConfig(r.risk_level)
              const isSelected = selected?.id === r.id
              return (
                <div
                  key={r.id}
                  onClick={() => setSelected(r)}
                  style={{
                    padding: '12px 14px', borderRadius: 8, marginBottom: 8, cursor: 'pointer',
                    border: `1px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    background: isSelected ? 'var(--color-primary-light)' : '#fff',
                  }}
                >
                  <p style={{ fontWeight: 600, fontSize: 13 }}>{r.company_name}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{r.product_name} · {r.cn_code}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 4, background: `${cfg.color}20`, color: cfg.color, fontWeight: 700 }}>
                      {cfg.label}
                    </span>
                    <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{fmtDate(r.report_date)}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Detail */}
          {selected && (
            <div style={{ flex: 1 }}>
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700 }}>{selected.company_name} – {selected.product_name}</h2>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline btn-sm" onClick={copyJSON}><Copy size={14} /> JSON Kopyala</button>
                  </div>
                </div>

                <div className="grid-2" style={{ marginBottom: 20 }}>
                  {[
                    ['CN Kodu', selected.cn_code],
                    ['Üretim Rotası', selected.production_route],
                    ['Üretim Miktarı', `${selected.production_amount_ton} ton`],
                    ['Hesaplama Modu', selected.calculation_mode],
                    ['Rapor Tarihi', fmtDate(selected.report_date)],
                    ['Raporlama Dönemi', '2025-Q1'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                      <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{k}</p>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{v}</p>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Emisyon Kırılımı</h3>
                <div className="grid-2" style={{ marginBottom: 20 }}>
                  {[
                    ['Yakıt', selected.fuel_emission_tco2e],
                    ['Elektrik', selected.electricity_emission_tco2e],
                    ['Precursor', selected.precursor_emission_tco2e],
                    ['Taşıma', selected.transport_emission_tco2e],
                    ['Toplam Emisyon', selected.total_emission_tco2e],
                    ['Ürün Başına', selected.specific_emission_tco2e_per_ton],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                      <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{k}</p>
                      <p style={{ fontSize: 14, fontWeight: 700 }}>{fmtNum(v, 2)} tCO₂e{k === 'Ürün Başına' ? '/ton' : ''}</p>
                    </div>
                  ))}
                </div>

                <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Benchmark & Risk</h3>
                <div className="grid-2">
                  {[
                    ['EPD Benchmark', '2.29 tCO₂e/ton'],
                    ['Benchmark Farkı', `${selected.difference_percent > 0 ? '+' : ''}${fmtNum(selected.difference_percent, 1)}%`],
                    ['Risk Seviyesi', getRiskConfig(selected.risk_level).label],
                    ['DQ Skoru', `${selected.data_quality_score} / 100`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                      <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{k}</p>
                      <p style={{ fontSize: 13, fontWeight: 700 }}>{v}</p>
                    </div>
                  ))}
                </div>

                <div className="alert alert-warning" style={{ marginTop: 16, fontSize: 12 }}>
                  ⚠️ Bu rapor EPD-IES-0023407 benchmark değeri kullanılarak hazırlanmıştır. Nihai CBAM raporlaması için Verifying Authority onayı gerekir.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </PageContainer>
  )
}
