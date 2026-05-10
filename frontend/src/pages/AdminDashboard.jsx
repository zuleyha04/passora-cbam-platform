import { useState, useEffect } from 'react'
import PageContainer from '../components/layout/PageContainer'
import MetricCard from '../components/cards/MetricCard'
import AdminReportsTable from '../components/tables/AdminReportsTable'
import { AdminRiskDistributionChart, AdminEmissionByCompanyChart, AdminModeDistributionChart } from '../components/charts/AdminCharts'
import { SupplierEmissionChart, SupplierCostCarbonChart, CarbonSavingCard } from '../components/charts/SupplierCharts'
import SupplierComparisonTable from '../components/tables/SupplierComparisonTable'
import { getAdminSummary, getAdminReports, getSupplierScenarios } from '../api/adminApi'
import { fmtNum } from '../utils/formatters'
import { Building2, BarChart3, AlertTriangle, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null)
  const [reports, setReports] = useState([])
  const [scenarios, setScenarios] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState(null)

  useEffect(() => {
    Promise.all([getAdminSummary(), getAdminReports(), getSupplierScenarios()])
      .then(([s, r, sc]) => { setSummary(s); setReports(r); setScenarios(sc) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageContainer title="Admin Dashboard"><div style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-muted)' }}>Veriler yükleniyor...</div></PageContainer>

  return (
    <PageContainer title="Admin Dashboard" subtitle="Sistem geneli karbon ve veri kalitesi özeti">
      {/* System status */}
      {summary?.system_status && (
        <div className="alert alert-success" style={{ marginBottom: 20, fontSize: 12 }}>
          ✅ Backend API: <strong>{summary.system_status.backend_api}</strong> &nbsp;|&nbsp;
          Calculation Engine: <strong>{summary.system_status.calculation_engine}</strong> &nbsp;|&nbsp;
          Mock DB: <strong>{summary.system_status.mock_database}</strong> &nbsp;|&nbsp;
          Son rapor: <strong>{summary.system_status.last_report_generated_at}</strong>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <MetricCard label="Toplam Firma" value={summary?.total_companies} icon={Building2} color="var(--color-primary)" bg="var(--color-primary-light)" />
        <MetricCard label="Toplam Hesaplama" value={summary?.total_calculations} icon={BarChart3} color="#3B82F6" bg="#DBEAFE" />
        <MetricCard label="Ort. DQ Skoru" value={summary?.average_data_quality_score} unit="/ 100" icon={Activity} color="#D97706" bg="#FEF3C7" />
        <MetricCard label="Kritik Risk" value={summary?.critical_risk_count} icon={AlertTriangle} color="#DC2626" bg="#FEE2E2" sub="hesaplama kritik seviyede" />
      </div>
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <MetricCard label="Ort. Spesifik Emisyon" value={fmtNum(summary?.average_specific_emission, 2)} unit="tCO₂e/ton" />
        <MetricCard label="Eksik Veri Oranı" value={`${summary?.missing_data_rate_percent}%`} sub="ortalama eksik alan başına" />
        <MetricCard label="En Çok Kullanılan CN" value={summary?.top_cn_codes?.[0]?.cn_code || '–'} sub={`${summary?.top_cn_codes?.[0]?.count || 0} hesaplama`} />
      </div>

      {/* Charts row */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <AdminEmissionByCompanyChart reports={reports} />
        <AdminRiskDistributionChart reports={reports} />
        <AdminModeDistributionChart distribution={summary?.calculation_mode_distribution} />
      </div>

      {/* Reports table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Son Raporlar</h3>
        <AdminReportsTable reports={reports} onView={setSelectedReport} />
      </div>

      {/* Report detail modal-like */}
      {selectedReport && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div className="card" style={{ maxWidth: 600, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700 }}>Rapor Detayı – {selectedReport.company_name}</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setSelectedReport(null)}>Kapat</button>
            </div>
            <div className="grid-2" style={{ marginBottom: 12 }}>
              {[
                ['Ürün', selectedReport.product_name],
                ['CN Kodu', selectedReport.cn_code],
                ['Mod', selectedReport.calculation_mode],
                ['Üretim Rotası', selectedReport.production_route],
                ['Üretim Miktarı', `${selectedReport.production_amount_ton} ton`],
                ['Toplam Emisyon', `${fmtNum(selectedReport.total_emission_tco2e)} tCO₂e`],
                ['Spesifik Emisyon', `${fmtNum(selectedReport.specific_emission_tco2e_per_ton, 2)} tCO₂e/ton`],
                ['EPD Fark', `${selectedReport.difference_percent > 0 ? '+' : ''}${fmtNum(selectedReport.difference_percent, 1)}%`],
                ['DQ Skoru', selectedReport.data_quality_score],
                ['Risk', selectedReport.risk_level.toUpperCase()],
              ].map(([k, v]) => (
                <div key={k} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{k}</p>
                  <p style={{ fontSize: 13, fontWeight: 600 }}>{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Supplier scenarios */}
      {scenarios && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Tedarikçi Senaryo Analizi</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 20 }}>
            Mevcut hammadde farklı bir tedarikçiden alınsaydı karbon emisyonu ve maliyet nasıl değişirdi?
          </p>
          <CarbonSavingCard savingTco2e={scenarios.carbon_saving_tco2e} note={scenarios.carbon_saving_note} />
          <div style={{ marginTop: 16 }}>
            <div className="card" style={{ marginBottom: 16 }}>
              <SupplierComparisonTable rows={scenarios.rows} />
            </div>
            <div className="grid-2">
              <SupplierEmissionChart rows={scenarios.rows} />
              <SupplierCostCarbonChart rows={scenarios.rows} />
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
