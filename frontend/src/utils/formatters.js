// formatters.js
export const fmtNum = (n, d = 2) =>
  n == null ? '–' : Number(n).toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d })

export const fmtPct = (n) => n == null ? '–' : `${n > 0 ? '+' : ''}${fmtNum(n, 1)}%`

export const fmtTon = (n) => n == null ? '–' : `${fmtNum(n)} tCO₂e`

export const fmtDate = (s) => {
  if (!s) return '–'
  return new Date(s).toLocaleDateString('tr-TR')
}
