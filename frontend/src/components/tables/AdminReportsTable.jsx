import { fmtNum, fmtDate } from '../../utils/formatters'
import { getRiskConfig } from '../../utils/riskHelpers'

export default function AdminReportsTable({ reports, onView }) {
  if (!reports || reports.length === 0) return <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Rapor bulunamadı.</p>

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Firma</th>
            <th>Ürün</th>
            <th>CN Kodu</th>
            <th>Hesaplama Modu</th>
            <th>Toplam Emisyon</th>
            <th>tCO₂e/ton</th>
            <th>DQ Skoru</th>
            <th>Risk</th>
            <th>Tarih</th>
            <th>Aksiyon</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => {
            const cfg = getRiskConfig(r.risk_level)
            return (
              <tr key={r.id}>
                <td style={{ fontWeight: 500 }}>{r.company_name}</td>
                <td>{r.product_name}</td>
                <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.cn_code}</span></td>
                <td>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99,
                    background: r.calculation_mode === 'actual_data' ? '#DCFCE7' : r.calculation_mode === 'hybrid' ? '#FEF3C7' : '#DBEAFE',
                    color: r.calculation_mode === 'actual_data' ? '#166534' : r.calculation_mode === 'hybrid' ? '#92400E' : '#1E40AF',
                    fontWeight: 600,
                  }}>
                    {r.calculation_mode}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{fmtNum(r.total_emission_tco2e, 0)} tCO₂e</td>
                <td>{fmtNum(r.specific_emission_tco2e_per_ton, 2)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ flex: 1, height: 6, background: '#E2E8F0', borderRadius: 3 }}>
                      <div style={{ width: `${r.data_quality_score}%`, height: '100%', borderRadius: 3,
                        background: r.data_quality_score >= 85 ? '#16A34A' : r.data_quality_score >= 65 ? '#F59E0B' : '#EF4444' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{r.data_quality_score}</span>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: `${cfg.color}20`, color: cfg.color, fontWeight: 700 }}>
                    {cfg.label}
                  </span>
                </td>
                <td style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{fmtDate(r.report_date)}</td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => onView?.(r)}>Görüntüle</button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
