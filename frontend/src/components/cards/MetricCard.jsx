export default function MetricCard({ label, value, unit, sub, icon: Icon, color, bg }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {label}
        </span>
        {Icon && (
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: bg || 'var(--color-primary-light)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={16} color={color || 'var(--color-primary)'} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontSize: 26, fontWeight: 700, color: color || 'var(--color-text)', lineHeight: 1 }}>
          {value ?? '–'}
        </span>
        {unit && <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{unit}</span>}
      </div>
      {sub && <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{sub}</p>}
    </div>
  )
}
