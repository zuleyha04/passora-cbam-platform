export const RISK = {
  low:      { tr: 'Düşük',  color: '#16A34A', bg: '#DCFCE7', border: '#BBF7D0' },
  medium:   { tr: 'Orta',   color: '#D97706', bg: '#FEF3C7', border: '#FDE68A' },
  high:     { tr: 'Yüksek', color: '#EA580C', bg: '#FFEDD5', border: '#FED7AA' },
  critical: { tr: 'Kritik', color: '#DC2626', bg: '#FEE2E2', border: '#FECACA' },
}

export const MOD = {
  actual_data:   { tr: 'Gerçek Veri',  color: '#166534', bg: '#DCFCE7' },
  hybrid:        { tr: 'Karma',        color: '#92400E', bg: '#FEF3C7' },
  epd_benchmark: { tr: 'Referans EPD', color: '#1E40AF', bg: '#DBEAFE' },
}

export function getRisk(level) { return RISK[level] || RISK.medium }
export function getMod(mode)   { return MOD[mode]   || MOD.hybrid  }

export function fmtNum(n, d = 1) {
  if (n == null) return '–'
  return Number(n).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })
}

export function fmtDate(s) {
  if (!s) return '–'
  return new Date(s).toLocaleDateString('tr-TR')
}