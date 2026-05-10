import { getRiskConfig } from '../../utils/riskHelpers'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'

export default function RiskLevelCard({ riskLevel, differencePercent, largestSource, firstAction, summary }) {
  const cfg = getRiskConfig(riskLevel)
  const icons = { low: CheckCircle, medium: Info, high: AlertTriangle, critical: AlertTriangle }
  const Icon = icons[riskLevel] || Info

  return (
    <div className="card" style={{ borderLeft: `4px solid ${cfg.color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Icon size={20} color={cfg.color} />
        <span style={{ fontWeight: 700, fontSize: 15, color: cfg.color }}>
          Risk Seviyesi: {cfg.label}
        </span>
      </div>
      <p style={{ fontSize: 13, color: 'var(--color-text)', marginBottom: 8 }}>{summary}</p>
      {largestSource && (
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 4 }}>
          📌 En büyük emisyon kaynağı: <strong>{largestSource}</strong>
        </p>
      )}
      {firstAction && (
        <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          ✅ Önerilen ilk aksiyon: {firstAction}
        </p>
      )}
    </div>
  )
}
