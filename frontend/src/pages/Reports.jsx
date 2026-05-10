import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import PageContainer from '../components/layout/PageContainer'
import { ReportFilters, ReportsTable } from '../components/reports/ReportsComponents'
import { MOCK_REPORTS } from '../data/mockData'

function normalizeText(value) {
  return String(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .trim()
}

function getReportCompany(report) {
  return report.company || report.firma || ''
}

function getReportProduct(report) {
  return report.product || report.urun || ''
}

function getReportId(report) {
  return report.id || report.report_id || report.reportId || ''
}

function getFocusTitle(focus) {
  if (focus === 'missing-data') {
    return 'Eksik Veri Takibi'
  }

  if (focus === 'calculation-mode') {
    return 'Karma Hesaplama Kontrolü'
  }

  if (focus === 'data-quality') {
    return 'Veri Kalitesi İncelemesi'
  }

  if (focus === 'critical-risk') {
    return 'Kritik Risk İncelemesi'
  }

  if (focus === 'report-detail') {
    return 'Rapor Detayı'
  }

  return 'Odaklı Rapor Görünümü'
}

function getFocusDescription(focus, company, product) {
  const targetText = [company, product].filter(Boolean).join(' / ')

  if (focus === 'missing-data') {
    return `${targetText || 'Seçili kayıt'} için eksik veri alanları kontrol edilmeli ve firmadan tamamlayıcı veri istenmelidir.`
  }

  if (focus === 'calculation-mode') {
    return `${targetText || 'Seçili kayıt'} için karma/hybrid hesaplama kullanılmış. Daha doğru sonuç için gerçek tesis verisi talep edilmelidir.`
  }

  if (focus === 'data-quality') {
    return `${targetText || 'Seçili kayıt'} için veri kalite skoru düşük. Hesaplama güvenilirliği artırılmalıdır.`
  }

  if (focus === 'critical-risk') {
    return `${targetText || 'Seçili kayıt'} için emisyon/risk seviyesi kritik görünüyor. Rapor detayları öncelikli incelenmelidir.`
  }

  return `${targetText || 'Seçili kayıt'} için dashboard üzerinden yönlendirilen raporlar listeleniyor.`
}

export default function Reports() {
  const [searchParams] = useSearchParams()
  const [filtered, setFiltered] = useState(MOCK_REPORTS)

  const reportId = searchParams.get('reportId')
  const companyParam = searchParams.get('company')
  const productParam = searchParams.get('product')
  const focusParam = searchParams.get('focus')

  const hasDashboardFocus = Boolean(
    reportId || companyParam || productParam || focusParam
  )

  const focusedReports = useMemo(() => {
    if (!hasDashboardFocus) {
      return MOCK_REPORTS
    }

    const targetReportId = normalizeText(reportId)
    const targetCompany = normalizeText(companyParam)
    const targetProduct = normalizeText(productParam)

    const matched = MOCK_REPORTS.filter((report) => {
      const currentId = normalizeText(getReportId(report))
      const currentCompany = normalizeText(getReportCompany(report))
      const currentProduct = normalizeText(getReportProduct(report))

      const matchesReportId =
        targetReportId && currentId && currentId === targetReportId

      const matchesCompany =
        targetCompany && currentCompany.includes(targetCompany)

      const matchesProduct =
        targetProduct && currentProduct.includes(targetProduct)

      if (targetReportId) return matchesReportId
      if (targetCompany && targetProduct) return matchesCompany && matchesProduct
      if (targetCompany) return matchesCompany
      if (targetProduct) return matchesProduct

      return true
    })

    return matched.length > 0 ? matched : MOCK_REPORTS
  }, [hasDashboardFocus, reportId, companyParam, productParam])

  useEffect(() => {
    setFiltered(focusedReports)
  }, [focusedReports])

  return (
    <PageContainer
      title="Raporlar"
      subtitle="Tüm hesaplama kayıtları, filtreler ve detaylı görünüm"
    >
      {hasDashboardFocus && (
        <div
          style={{
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderLeft: '4px solid #0D7A5F',
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 16,
          }}
        >
          <p
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#065F46',
              marginBottom: 4,
            }}
          >
            {getFocusTitle(focusParam)}
          </p>

          <p
            style={{
              fontSize: 13,
              color: '#047857',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {getFocusDescription(focusParam, companyParam, productParam)}
          </p>
        </div>
      )}

      <div
        style={{
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            padding: '18px 22px',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: 14,
              gap: 12,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#1E293B',
                  marginBottom: 2,
                }}
              >
                Hesaplama Kayıtları
              </p>

              <p
                style={{
                  fontSize: 12,
                  color: '#94A3B8',
                }}
              >
                {filtered.length} kayıt gösteriliyor
              </p>
            </div>
          </div>

          <ReportFilters reports={focusedReports} onFilter={setFiltered} />
        </div>

        <ReportsTable reports={filtered} />
      </div>
    </PageContainer>
  )
}