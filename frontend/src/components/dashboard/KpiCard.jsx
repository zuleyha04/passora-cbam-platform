export default function KpiCard({ label, value, unit, icon, color, bg, sub, trend, trendLabel }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E2E8F0',
      borderRadius: 14,
      padding: '18px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Arka dekor */}
      <div style={{
        position: 'absolute', right: -16, top: -16,
        width: 80, height: 80, borderRadius: '50%',
        background: bg, opacity: 0.4,
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: bg, display: 'flex',
          alignItems: 'center', justifyContent: 'center', fontSize: 18,
        }}>
          {icon}
        </div>
        {trend !== undefined && (
          <span style={{
            fontSize: 11, fontWeight: 700,
            color: trend > 0 ? '#DC2626' : '#16A34A',
            background: trend > 0 ? '#FEE2E2' : '#DCFCE7',
            padding: '2px 8px', borderRadius: 99,
          }}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div style={{ position: 'relative' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>
          {label}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
          <span style={{ fontSize: 28, fontWeight: 800, color: color || '#1E293B', lineHeight: 1 }}>
            {value ?? '–'}
          </span>
          {unit && <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>{unit}</span>}
        </div>
        {(sub || trendLabel) && (
          <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{trendLabel || sub}</p>
        )}
      </div>
    </div>
  )
}
