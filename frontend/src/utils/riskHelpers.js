export const RISK_CONFIG = {
  low:      { label: 'Low',      color: '#16A34A', bg: '#DCFCE7', badge: 'badge-low' },
  medium:   { label: 'Medium',   color: '#D97706', bg: '#FEF3C7', badge: 'badge-medium' },
  high:     { label: 'High',     color: '#EA580C', bg: '#FFEDD5', badge: 'badge-high' },
  critical: { label: 'Critical', color: '#DC2626', bg: '#FEE2E2', badge: 'badge-critical' },
}

export function getRiskConfig(level) {
  return RISK_CONFIG[level] || RISK_CONFIG.medium
}

export function riskBadge(level) {
  const c = getRiskConfig(level)
  return c.badge
}
