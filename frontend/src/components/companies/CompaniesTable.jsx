import { getRisk, fmtNum, fmtDate } from '../../data/helpers'

export default function CompaniesTable({ companies }) {
  if (!companies || companies.length === 0) return <p style={{ color: '#94A3B8', fontSize: 13 }}>Firma bulunamadı.</p>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F8FAFC' }}>
            {['Firma Adı','Sektör','Ürün Sayısı','Toplam Emisyon','Ort. DQ Skoru','Risk Seviyesi','Son Hesaplama',''].map(h => (
              <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 600, color: '#94A3B8', textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {companies.map(c => {
            const risk = getRisk(c.top_risk)
            return (
              <tr key={c.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: '#1E293B' }}>{c.name}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, color: '#475569' }}>{c.sector}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, textAlign: 'center', fontWeight: 600 }}>{c.product_count}</td>
                <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {fmtNum(c.total_emission, 0)} tCO₂e
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 5, background: '#E2E8F0', borderRadius: 3, minWidth: 60 }}>
                      <div style={{ width: `${c.avg_dq_score}%`, height: '100%', borderRadius: 3,
                        background: c.avg_dq_score >= 85 ? '#16A34A' : c.avg_dq_score >= 65 ? '#F59E0B' : '#EF4444' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{c.avg_dq_score}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ fontSize: 11, padding: '3px 12px', borderRadius: 99, fontWeight: 700, background: risk.bg, color: risk.color }}>{risk.tr}</span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: 12, color: '#94A3B8', whiteSpace: 'nowrap' }}>{fmtDate(c.last_report_date)}</td>
                <td style={{ padding: '14px 16px' }}>
                  <button style={{ fontSize: 12, padding: '5px 14px', borderRadius: 7, border: '1px solid #E2E8F0', background: '#fff', color: '#475569', cursor: 'pointer', fontWeight: 500 }}>
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
