const BASE = '/api/admin'

async function apiFetch(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export const getAdminSummary = () => apiFetch(`${BASE}/summary`)
export const getAdminReports = () => apiFetch(`${BASE}/reports`)
export const getSupplierScenarios = () => apiFetch(`${BASE}/supplier-scenarios`)
