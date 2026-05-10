import { useState, useEffect } from 'react'
import PageContainer from '../components/layout/PageContainer'
import { getAdminReports } from '../api/adminApi'
import { fmtNum, fmtDate } from '../utils/formatters'
import { getRiskConfig } from '../utils/riskHelpers'

export function AdminCompanies() {
  const [reports, setReports] = useState([])
  useEffect(() => { getAdminReports().then(setReports).catch(console.error) }, [])

  const companies = {}
  reports.forEach(r => {
    if (!companies[r.company_id]) companies[r.company_id] = { name: r.company_name, reports: [], totalEmission: 0, maxRisk: 'low' }
    companies[r.company_id].reports.push(r)
    companies[r.company_id].totalEmission += r.total_emission_tco2e
  })

  return (
    <PageContainer title="Companies" subtitle="Tüm firmaların CBAM durumu">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {Object.values(companies).map((c, i) => {
          const risks = c.reports.map(r => r.risk_level)
          const topRisk = ['critical', 'high', 'medium', 'low'].find(r => risks.includes(r)) || 'low'
          const cfg = getRiskConfig(topRisk)
          return (
            <div key={i} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{c.reports.length} hesaplama · {fmtNum(c.totalEmission, 0)} tCO₂e toplam</p>
              </div>
              <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 99, background: `${cfg.color}20`, color: cfg.color, fontWeight: 700 }}>
                {cfg.label} Risk
              </span>
            </div>
          )
        })}
      </div>
    </PageContainer>
  )
}

export function AdminScenarios() {
  return (
    <PageContainer title="Supplier Scenarios" subtitle="Admin tedarikçi senaryo analizi">
      <div className="alert alert-info" style={{ marginBottom: 16 }}>
        Admin tedarikçi senaryo analizi Admin Dashboard sayfasında bulunmaktadır.
      </div>
      <a href="/admin" className="btn btn-primary">Admin Dashboard'a Git</a>
    </PageContainer>
  )
}
