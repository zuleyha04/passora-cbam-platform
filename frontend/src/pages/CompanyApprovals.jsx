import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PageContainer from '../components/layout/PageContainer'
import { COMPANY_APPROVALS } from '../data/companyMockData'

function formatNumber(value, digits = 2) {
  return Number(value || 0).toLocaleString('tr-TR', {
    maximumFractionDigits: digits,
  })
}

function getRiskClass(risk) {
  const value = String(risk || '').toLowerCase()

  if (value.includes('kritik')) return 'badge badge-critical'
  if (value.includes('yüksek')) return 'badge badge-high'
  if (value.includes('orta')) return 'badge badge-medium'
  if (value.includes('düşük')) return 'badge badge-low'

  return 'badge badge-medium'
}

function getModeClass(mode) {
  const value = String(mode || '').toLowerCase()

  if (value.includes('actual')) return 'badge badge-low'
  if (value.includes('hybrid')) return 'badge badge-medium'
  if (value.includes('default')) return 'badge badge-critical'

  return 'badge badge-medium'
}

export default function CompanyApprovals() {
  const [searchParams] = useSearchParams()

  const [localApprovals, setLocalApprovals] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('passora_pending_approvals') || '[]')
    } catch {
      return []
    }
  })

  const approvalItems = useMemo(() => {
    return [...localApprovals, ...COMPANY_APPROVALS]
  }, [localApprovals])

  const addedFromCbam = searchParams.get('added') === '1'

  function handleApprove(item) {
    const updated = localApprovals.filter((approval) => approval.id !== item.id)

    setLocalApprovals(updated)
    localStorage.setItem('passora_pending_approvals', JSON.stringify(updated))
  }

  function handleRevision(item) {
    alert(`${item.product} için revizyon talebi oluşturuldu.`)
  }

  return (
    <PageContainer
      title="Onay Bekleyenler"
      subtitle="Firma admini tarafından onaylanması gereken hesaplamalar"
    >
      {addedFromCbam && (
        <div className="approval-success-message">
          <strong>Hesaplama onaya gönderildi.</strong>
          <p>
            Eksik alanlar varsa default değerlerle tamamlandı ve hesaplama onay
            bekleyenler listesine eklendi.
          </p>
        </div>
      )}

      <div className="approval-summary-grid">
        <div className="approval-summary-card">
          <span>Onay Bekleyen</span>
          <strong>{approvalItems.length}</strong>
          <small>Yönetici aksiyonu gerekli</small>
        </div>

        <div className="approval-summary-card">
          <span>Hybrid / Default</span>
          <strong>
            {
              approvalItems.filter((item) =>
                String(item.calculationMode || '').toLowerCase().includes('hybrid') ||
                String(item.calculationMode || '').toLowerCase().includes('default')
              ).length
            }
          </strong>
          <small>Varsayılan veri içerebilir</small>
        </div>

        <div className="approval-summary-card">
          <span>Kritik Risk</span>
          <strong>
            {
              approvalItems.filter((item) =>
                String(item.risk || '').toLowerCase().includes('kritik')
              ).length
            }
          </strong>
          <small>Öncelikli inceleme</small>
        </div>
      </div>

      <div className="card approval-table-card">
        <div className="panel-header compact">
          <div>
            <h3 className="section-title">Onay Bekleyen Hesaplamalar</h3>
            <p>
              Hesaplama modu, eksik veri oranı ve risk seviyesi kontrol edilerek
              son onay verilir.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Dönem</th>
                <th>Toplam Emisyon</th>
                <th>Spesifik Emisyon</th>
                <th>Veri Kalitesi</th>
                <th>Eksik Veri</th>
                <th>Hesaplama Modu</th>
                <th>Risk</th>
                <th>Durum</th>
                <th>Aksiyon</th>
              </tr>
            </thead>

            <tbody>
              {approvalItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.product}</strong>
                    {item.defaultsUsed?.length > 0 && (
                      <small className="table-subtext">
                        Default: {item.defaultsUsed.join(', ')}
                      </small>
                    )}
                  </td>

                  <td>{item.period}</td>

                  <td>
                    <strong>{formatNumber(item.totalEmission, 2)} tCO₂e</strong>
                  </td>

                  <td>
                    {formatNumber(item.specificEmission, 2)} tCO₂e/ton
                  </td>

                  <td>{item.dataQuality} / 100</td>

                  <td>{item.missingRatio ?? 0}%</td>

                  <td>
                    <span className={getModeClass(item.calculationMode)}>
                      {item.calculationMode}
                    </span>
                  </td>

                  <td>
                    <span className={getRiskClass(item.risk)}>
                      {item.risk}
                    </span>
                  </td>

                  <td>
                    <span className="company-status-pill-2 company-status-warning">
                      {item.status || 'Onay Bekliyor'}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button className="btn btn-outline btn-sm">
                        Detay Gör
                      </button>

                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleApprove(item)}
                      >
                        Onayla
                      </button>

                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleRevision(item)}
                      >
                        Revizyon İste
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {approvalItems.length === 0 && (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', color: '#94A3B8' }}>
                    Onay bekleyen hesaplama bulunmuyor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  )
}