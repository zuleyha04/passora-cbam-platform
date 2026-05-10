import { useState } from 'react'
import { getRisk, getMod, fmtNum, fmtDate } from '../../data/helpers'

export function ReportFilters({ reports, onFilter }) {
  const [firma, setFirma] = useState('')
  const [risk, setRisk] = useState('')
  const [mod, setMod] = useState('')

  const firmalar = [...new Set(reports.map(r => r.company_name))]

  function uygula(yeniFirma, yeniRisk, yeniMod) {
    let filtered = [...reports]
    if (yeniFirma) filtered = filtered.filter(r => r.company_name === yeniFirma)
    if (yeniRisk)  filtered = filtered.filter(r => r.risk_level === yeniRisk)
    if (yeniMod)   filtered = filtered.filter(r => r.calculation_mode === yeniMod)
    onFilter(filtered)
  }

  function degistir(tip, deger) {
    const yeniFirma = tip === 'firma' ? deger : firma
    const yeniRisk  = tip === 'risk'  ? deger : risk
    const yeniMod   = tip === 'mod'   ? deger : mod
    if (tip === 'firma') setFirma(deger)
    if (tip === 'risk')  setRisk(deger)
    if (tip === 'mod')   setMod(deger)
    uygula(yeniFirma, yeniRisk, yeniMod)
  }

  function sifirla() {
    setFirma(''); setRisk(''); setMod('')
    onFilter(reports)
  }

  const selectStyle = {
    padding: '7px 12px', borderRadius: 8, border: '1px solid #E2E8F0',
    fontSize: 13, color: '#1E293B', background: '#fff', cursor: 'pointer',
  }

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
      <select value={firma} onChange={e => degistir('firma', e.target.value)} style={selectStyle}>
        <option value="">Tüm Firmalar</option>
        {firmalar.map(f => <option key={f} value={f}>{f}</option>)}
      </select>
      <select value={risk} onChange={e => degistir('risk', e.target.value)} style={selectStyle}>
        <option value="">Tüm Risk Seviyeleri</option>
        {[['low','Düşük'],['medium','Orta'],['high','Yüksek'],['critical','Kritik']].map(([v,l]) =>
          <option key={v} value={v}>{l}</option>
        )}
      </select>
      <select value={mod} onChange={e => degistir('mod', e.target.value)} style={selectStyle}>
        <option value="">Tüm Hesaplama Modları</option>
        <option value="actual_data">Gerçek Veri</option>
        <option value="hybrid">Karma</option>
        <option value="epd_benchmark">Referans EPD</option>
      </select>
      {(firma || risk || mod) && (
        <button onClick={sifirla} style={{ ...selectStyle, color: '#DC2626', borderColor: '#FECACA', background: '#FEF2F2' }}>
          × Filtreyi Temizle
        </button>
      )}
    </div>
  )
}

export function ReportsTable({ reports }) {
  if (!reports || reports.length === 0) {
    return <p style={{ color: '#94A3B8', fontSize: 13, padding: 16 }}>Sonuç bulunamadı.</p>
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F8FAFC' }}>
            {['Firma','Ürün','CN Kodu','Hesaplama Modu','Toplam Emisyon','Spesifik','DQ','Risk','Tarih',''].map(h => (
              <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#94A3B8', textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {reports.map(r => {
            const risk = getRisk(r.risk_level)
            const mod  = getMod(r.calculation_mode)
            return (
              <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: '#1E293B', whiteSpace: 'nowrap' }}>{r.company_name.split(' ').slice(0,2).join(' ')}</td>
                <td style={{ padding: '11px 14px', fontSize: 13, color: '#475569' }}>{r.product_name}</td>
                <td style={{ padding: '11px 14px' }}><span style={{ fontFamily: 'monospace', fontSize: 12, background: '#F1F5F9', padding: '2px 6px', borderRadius: 4 }}>{r.cn_code}</span></td>
                <td style={{ padding: '11px 14px' }}><span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 600, background: mod.bg, color: mod.color }}>{mod.tr}</span></td>
                <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap' }}>{fmtNum(r.total_emission_tco2e, 0)} tCO₂e</td>
                <td style={{ padding: '11px 14px', fontSize: 13, color: '#475569', whiteSpace: 'nowrap' }}>{fmtNum(r.specific_emission_tco2e_per_ton, 2)} t/t</td>
                <td style={{ padding: '11px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 40, height: 4, background: '#E2E8F0', borderRadius: 2 }}>
                      <div style={{ width: `${r.data_quality_score}%`, height: '100%', borderRadius: 2,
                        background: r.data_quality_score >= 85 ? '#16A34A' : r.data_quality_score >= 65 ? '#F59E0B' : '#EF4444' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{r.data_quality_score}</span>
                  </div>
                </td>
                <td style={{ padding: '11px 14px' }}><span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 700, background: risk.bg, color: risk.color }}>{risk.tr}</span></td>
                <td style={{ padding: '11px 14px', fontSize: 12, color: '#94A3B8', whiteSpace: 'nowrap' }}>{fmtDate(r.report_date)}</td>
                <td style={{ padding: '11px 14px' }}>
                  <button style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', color: '#475569', cursor: 'pointer' }}>
                    Detay
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
