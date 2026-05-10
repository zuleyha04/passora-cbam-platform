import { fmtNum } from '../../utils/formatters'

const STATUS_STYLES = {
  best:      { color: '#166534', bg: '#DCFCE7', label: 'En düşük karbon' },
  good:      { color: '#1E40AF', bg: '#DBEAFE', label: 'Dengeli seçenek' },
  reference: { color: '#64748B', bg: '#F1F5F9', label: 'Mevcut tedarikçi' },
  high_risk: { color: '#991B1B', bg: '#FEE2E2', label: 'Yüksek risk' },
}

export default function SupplierComparisonTable({ rows }) {
  if (!rows || rows.length === 0) return <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Tedarikçi verisi yok.</p>

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Tedarikçi</th>
            <th>Hammadde</th>
            <th>Miktar (ton)</th>
            <th>EF (tCO₂e/ton)</th>
            <th>Toplam Emisyon</th>
            <th>Fark (mevcut vs.)</th>
            <th>Ton Fiyatı</th>
            <th>Toplam Maliyet</th>
            <th>EPD</th>
            <th>Karbon Durumu</th>
            <th>Öneri</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const s = STATUS_STYLES[r.carbon_status] || STATUS_STYLES.reference
            return (
              <tr key={r.supplier_id} style={r.is_current ? { background: '#F8FAFC' } : {}}>
                <td style={{ fontWeight: r.is_current ? 700 : 400 }}>{r.supplier_name}</td>
                <td>{r.material}</td>
                <td>{fmtNum(r.amount_ton, 0)}</td>
                <td>{fmtNum(r.emission_factor, 2)}</td>
                <td style={{ fontWeight: 600 }}>{fmtNum(r.total_emission_tco2e, 0)} tCO₂e</td>
                <td style={{ color: r.difference_vs_current_tco2e < 0 ? '#16A34A' : r.difference_vs_current_tco2e > 0 ? '#DC2626' : '#64748B', fontWeight: 600 }}>
                  {r.is_current ? '–' : `${r.difference_vs_current_tco2e > 0 ? '+' : ''}${fmtNum(r.difference_vs_current_tco2e, 0)}`}
                </td>
                <td>{fmtNum(r.price_per_ton, 0)} ₺</td>
                <td>{fmtNum(r.total_cost, 0)} ₺</td>
                <td>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: r.has_epd ? '#DCFCE7' : '#F1F5F9', color: r.has_epd ? '#166534' : '#64748B', fontWeight: 600 }}>
                    {r.has_epd ? '✓ Var' : '✗ Yok'}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: s.bg, color: s.color, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {s.label}
                  </span>
                </td>
                <td style={{ fontSize: 12, color: 'var(--color-text-muted)', maxWidth: 160 }}>{r.recommendation}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
