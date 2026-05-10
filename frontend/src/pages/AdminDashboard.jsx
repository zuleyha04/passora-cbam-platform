import { useMemo } from 'react'
import PageContainer from '../components/layout/PageContainer'
import SystemStatusBar from '../components/dashboard/SystemStatusBar'
import KpiCard from '../components/dashboard/KpiCard'
import TurkeyEmissionMap from '../components/dashboard/TurkeyEmissionMap'
import EmissionBarChart from '../components/dashboard/EmissionByCompanyChart'
import CriticalActionsPanel from '../components/dashboard/CriticalActionsPanel'
import RecentReportsTable from '../components/dashboard/RecentReportsTable'
import { MOCK_REPORTS, MOCK_CRITICAL_ACTIONS, getAdminSummary } from '../data/mockData'

export default function AdminDashboard() {
  const summary = useMemo(() => getAdminSummary(), [])

  return (
    <PageContainer title="Admin Dashboard" subtitle="Sistem geneli CBAM karbon uyum özeti">

      <SystemStatusBar />

      {/* KPI Kartları */}
      <div className="admin-kpi-grid">
        <KpiCard
          label="Toplam Firma"
          value={summary.total_companies}
          icon="🏭"
          color="#0D7A5F"
          bg="#E6F4F0"
          sub="Aktif CBAM firması"
        />

        <KpiCard
          label="Toplam Hesaplama"
          value={summary.total_calculations}
          icon="📊"
          color="#3B82F6"
          bg="#DBEAFE"
          sub="Tüm dönemler"
        />

        <KpiCard
          label="Güncel Emisyon"
          value={summary.total_emission.toLocaleString('tr-TR')}
          unit="tCO₂e"
          icon="🌫️"
          color="#7C3AED"
          bg="#EDE9FE"
          trend={12}
          trendLabel="Geçen döneme göre"
        />

        <KpiCard
          label="Kritik Risk"
          value={summary.critical_risk_count}
          icon="🚨"
          color="#DC2626"
          bg="#FEE2E2"
          sub="Acil aksiyon gerekli"
        />

        <KpiCard
          label="Ort. Veri Kalitesi"
          value={summary.avg_dq_score}
          unit="/ 100"
          icon="🎯"
          color={summary.avg_dq_score >= 85 ? '#16A34A' : summary.avg_dq_score >= 65 ? '#D97706' : '#DC2626'}
          bg={summary.avg_dq_score >= 85 ? '#DCFCE7' : summary.avg_dq_score >= 65 ? '#FEF3C7' : '#FEE2E2'}
          sub="Ortalama DQ skoru"
        />
      </div>

      {/* Orta Bölüm: Harita + Firma Emisyon Karşılaştırması */}
      <div className="admin-map-chart-grid">
        <TurkeyEmissionMap mapData={summary.map_data} />
        <EmissionBarChart data={summary.emission_by_company} />
      </div>

      {/* Alt Bölüm: Son Raporlar + Aksiyonlar */}
      <div className="admin-reports-actions-grid">
        <RecentReportsTable reports={MOCK_REPORTS} />
        <CriticalActionsPanel actions={MOCK_CRITICAL_ACTIONS} />
      </div>

    </PageContainer>
  )
}