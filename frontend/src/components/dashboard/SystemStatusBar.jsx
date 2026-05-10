export default function SystemStatusBar() {
  const items = [
    { label: 'Sistem', value: 'Aktif', ok: true },
    { label: 'Hesaplama Motoru', value: 'Online', ok: true },
    { label: 'Veri Kaynağı', value: 'Demo / Mock DB', ok: true },
    { label: 'Son Güncelleme', value: new Date().toLocaleDateString('tr-TR'), ok: true },
  ]
  return (
    <div style={{
      display: 'flex', gap: 0, background: '#fff',
      border: '1px solid #E2E8F0', borderRadius: 10,
      marginBottom: 20, overflow: 'hidden',
    }}>
      {items.map((item, i) => (
        <div key={i} style={{
          flex: 1, padding: '9px 16px',
          borderRight: i < items.length - 1 ? '1px solid #F1F5F9' : 'none',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
            background: item.ok ? '#16A34A' : '#DC2626',
            boxShadow: item.ok ? '0 0 0 3px #DCFCE7' : '0 0 0 3px #FEE2E2',
          }} />
          <div>
            <p style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{item.label}</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#1E293B' }}>{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
