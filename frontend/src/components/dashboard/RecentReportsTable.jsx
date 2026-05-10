import { useNavigate } from 'react-router-dom'

const RISK = {
  low: {
    tr: 'Düşük',
    color: '#16A34A',
    bg: '#DCFCE7',
  },
  medium: {
    tr: 'Orta',
    color: '#D97706',
    bg: '#FEF3C7',
  },
  high: {
    tr: 'Yüksek',
    color: '#EA580C',
    bg: '#FFEDD5',
  },
  critical: {
    tr: 'Kritik',
    color: '#DC2626',
    bg: '#FEE2E2',
  },
}

function formatEmission(value) {
  if (value === undefined || value === null) return '-'
  return Number(value).toLocaleString('tr-TR', {
    maximumFractionDigits: 0,
  })
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('tr-TR')
}

function getCompanyShortName(companyName) {
  if (!companyName) return '-'
  return companyName.split(' ').slice(0, 2).join(' ')
}

export default function RecentReportsTable({ reports = [] }) {
  const navigate = useNavigate()

  const recentReports = [...reports]
    .sort((a, b) => new Date(b.report_date) - new Date(a.report_date))
    .slice(0, 5)

  function handleOpenAllReports() {
    navigate('/admin/reports')
  }

  function handleOpenReport(report) {
    const params = new URLSearchParams()

    params.set('reportId', report.id)
    params.set('company', report.company_name)
    params.set('product', report.product_name)
    params.set('focus', 'report-detail')

    navigate(`/admin/reports?${params.toString()}`)
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #F1F5F9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div>
          <p
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#1E293B',
              margin: 0,
            }}
          >
            Son Raporlar
          </p>

          <p
            style={{
              fontSize: 11,
              color: '#94A3B8',
              margin: 0,
              marginTop: 2,
            }}
          >
            En güncel 5 hesaplama kaydı
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAllReports}
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: '#0D7A5F',
            background: '#E6F4F0',
            border: 'none',
            padding: '5px 12px',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Tümünü Gör →
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFC' }}>
              {[
                'Firma',
                'Ürün',
                'Toplam Emisyon',
                'Veri Kalitesi',
                'Risk',
                'Tarih',
                'Aksiyon',
              ].map((header) => (
                <th
                  key={header}
                  style={{
                    padding: '9px 16px',
                    fontSize: 11,
                    fontWeight: 600,
                    color: '#94A3B8',
                    textAlign: 'left',
                    borderBottom: '1px solid #F1F5F9',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {recentReports.map((report, index) => {
              const risk = RISK[report.risk_level] || RISK.medium

              return (
                <tr
                  key={report.id}
                  style={{
                    borderBottom:
                      index < recentReports.length - 1
                        ? '1px solid #F8FAFC'
                        : 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FAFBFC'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent'
                  }}
                >
                  <td
                    style={{
                      padding: '11px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#1E293B',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getCompanyShortName(report.company_name)}
                  </td>

                  <td
                    style={{
                      padding: '11px 16px',
                      fontSize: 12,
                      color: '#64748B',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {report.product_name}
                  </td>

                  <td
                    style={{
                      padding: '11px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#1E293B',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatEmission(report.total_emission_tco2e)} tCO₂e
                  </td>

                  <td style={{ padding: '11px 16px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 7,
                      }}
                    >
                      <div
                        style={{
                          width: 52,
                          height: 4,
                          background: '#E2E8F0',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${report.data_quality_score}%`,
                            height: '100%',
                            borderRadius: 2,
                            background:
                              report.data_quality_score >= 85
                                ? '#16A34A'
                                : report.data_quality_score >= 65
                                  ? '#F59E0B'
                                  : '#EF4444',
                          }}
                        />
                      </div>

                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          color: '#475569',
                        }}
                      >
                        {report.data_quality_score}
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '11px 16px' }}>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '3px 10px',
                        borderRadius: 99,
                        fontWeight: 700,
                        background: risk.bg,
                        color: risk.color,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {risk.tr}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: '11px 16px',
                      fontSize: 11,
                      color: '#94A3B8',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {formatDate(report.report_date)}
                  </td>

                  <td style={{ padding: '11px 16px' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenReport(report)}
                      style={{
                        fontSize: 11,
                        padding: '4px 10px',
                        borderRadius: 6,
                        border: '1px solid #E2E8F0',
                        background: '#fff',
                        color: '#64748B',
                        cursor: 'pointer',
                      }}
                    >
                      İncele
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}