const SEV_STYLE = {
  critical:       { bg: '#FEE2E2', color: '#991B1B', label: 'Kritik' },
  high:           { bg: '#FFEDD5', color: '#9A3412', label: 'Yüksek' },
  medium:         { bg: '#FEF3C7', color: '#92400E', label: 'Orta' },
  recommendation: { bg: '#F0F9FF', color: '#0369A1', label: 'Öneri' },
}

export default function MissingDataTable({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="alert alert-success">
        ✅ Tüm kritik alanlar dolu. Veri kalitesi yüksek.
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Alan</th>
            <th>Önem Derecesi</th>
            <th>Açıklama</th>
            <th>Puan Etkisi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const s = SEV_STYLE[item.severity] || SEV_STYLE.medium
            return (
              <tr key={i}>
                <td><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{item.field}</span></td>
                <td>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: s.bg, color: s.color, fontWeight: 600 }}>
                    {s.label}
                  </span>
                </td>
                <td style={{ fontSize: 13 }}>{item.message}</td>
                <td style={{ fontSize: 12, color: '#DC2626', fontWeight: 600 }}>-{item.penalty}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
