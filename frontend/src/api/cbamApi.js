const BASE = '/api/cbam/steel'

async function post(url, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `API error ${res.status}`)
  }
  return res.json()
}

async function get(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export const calculateSteel = (body) => post(`${BASE}/calculate`, body)
export const compareSuppliers = (suppliers) => post(`${BASE}/compare-suppliers`, { suppliers })
export const getReductionAdvice = (body) => post(`${BASE}/reduction-advice`, body)
export const getOffsetEquivalents = (body) => post(`${BASE}/offset-equivalents`, body)
export const checkMissingData = (body) => post(`${BASE}/check-missing-data`, body)
export const classifyCN = (code) => get(`${BASE}/classify-cn/${code}`)
export const getEPDBenchmark = () => get('/api/cbam/epd/steel-profile')
export const getReports = (companyId) => get(`/api/reports${companyId ? `?company_id=${companyId}` : ''}`)
