import { AlertTriangle, Zap, Lightbulb } from 'lucide-react'

const PRIORITY_STYLE = {
  critical: { color: '#DC2626', bg: '#FEE2E2', label: 'Kritik' },
  high:     { color: '#EA580C', bg: '#FFEDD5', label: 'Yüksek' },
  medium:   { color: '#D97706', bg: '#FEF3C7', label: 'Orta' },
  low:      { color: '#16A34A', bg: '#DCFCE7', label: 'Düşük' },
}

export default function ReductionAdvicePanel({ adviceList, usedDefaultsNote }) {
  if (!adviceList || adviceList.length === 0) return null

  return (
    <div>
      <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Lightbulb size={18} color="var(--color-primary)" />
        Karbon Azaltım Önerileri
      </h3>

      {usedDefaultsNote && (
        <div className="alert alert-warning" style={{ marginBottom: 16, fontSize: 12 }}>
          <AlertTriangle size={14} />
          {usedDefaultsNote}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {adviceList.map((advice, i) => {
          const ps = PRIORITY_STYLE[advice.priority] || PRIORITY_STYLE.medium
          return (
            <div key={i} className="card" style={{ borderLeft: `4px solid ${ps.color}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={16} color={ps.color} />
                  <strong style={{ fontSize: 14, color: 'var(--color-text)' }}>{advice.source}</strong>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>(%{advice.share_percent} pay)</span>
                </div>
                <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, background: ps.bg, color: ps.color, fontWeight: 700 }}>
                  {ps.label}
                </span>
              </div>

              <p style={{ fontSize: 13, color: 'var(--color-text)', marginBottom: 10 }}>{advice.problem}</p>

              <ul style={{ paddingLeft: 20, marginBottom: 10 }}>
                {advice.recommended_actions.map((action, j) => (
                  <li key={j} style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>{action}</li>
                ))}
              </ul>

              <div style={{ padding: '8px 12px', borderRadius: 6, background: 'var(--color-primary-light)', fontSize: 12, color: 'var(--color-primary-dark)', fontWeight: 500 }}>
                💡 Beklenen etki: {advice.expected_impact}
              </div>

              <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>{advice.note}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
