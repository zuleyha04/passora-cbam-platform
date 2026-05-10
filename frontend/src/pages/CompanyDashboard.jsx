import PageContainer from '../components/layout/PageContainer'
import {
  CURRENT_COMPANY,
  COMPANY_PRODUCTS,
  COMPANY_DATA_TASKS,
  COMPANY_APPROVALS,
  AI_RECOMMENDATIONS,
} from '../data/companyMockData'

function getRiskClass(risk) {
  const value = String(risk || '').toLowerCase()

  if (value.includes('kritik')) return 'badge badge-critical'
  if (value.includes('yüksek')) return 'badge badge-high'
  if (value.includes('orta')) return 'badge badge-medium'
  if (value.includes('düşük')) return 'badge badge-low'

  return 'badge badge-medium'
}

function getStatusClass(status) {
  const value = String(status || '').toLowerCase()

  if (value.includes('onay')) return 'company-status-warning'
  if (value.includes('eksik')) return 'company-status-danger'
  if (value.includes('tamam')) return 'company-status-success'
  if (value.includes('revizyon')) return 'company-status-danger'

  return 'company-status-neutral'
}

function Kpi({ label, value, sub, icon, tone }) {
  return (
    <div className={`company-kpi-card pro ${tone || ''}`}>
      <div className="company-kpi-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {sub && <small>{sub}</small>}
      </div>
    </div>
  )
}

function DataQualityBar({ value }) {
  const color = value >= 80 ? '#16A34A' : value >= 65 ? '#D97706' : '#DC2626'

  return (
    <div className="dq-cell">
      <div className="dq-track">
        <div
          className="dq-fill"
          style={{
            width: `${value}%`,
            background: color,
          }}
        />
      </div>
      <strong>{value}</strong>
    </div>
  )
}

export default function CompanyDashboard() {
  const completed = COMPANY_PRODUCTS.filter((p) =>
    String(p.status).toLowerCase().includes('tamam')
  ).length

  const missing = COMPANY_PRODUCTS.filter((p) =>
    String(p.status).toLowerCase().includes('eksik')
  ).length

  const critical = COMPANY_PRODUCTS.filter((p) => p.risk === 'Kritik').length

  const totalEmission = COMPANY_PRODUCTS.reduce(
    (sum, product) => sum + product.totalEmission,
    0
  )

  const avgDq = Math.round(
    COMPANY_PRODUCTS.reduce((sum, product) => sum + product.dataQuality, 0) /
      COMPANY_PRODUCTS.length
  )

  return (
    <PageContainer
      title="Firma Dashboard"
      subtitle={`${CURRENT_COMPANY.name} için CBAM hazırlık ve emisyon yönetimi`}
    >
      <div className="company-hero">
        <div className="company-hero-left">
          <div className="company-hero-badge">KOBİ Firma Admini Paneli</div>

          <h2>{CURRENT_COMPANY.name}</h2>

          <p>
            {CURRENT_COMPANY.sector} / {CURRENT_COMPANY.subSector} ·{' '}
            {CURRENT_COMPANY.city}, {CURRENT_COMPANY.country}
          </p>

          <div className="company-hero-meta">
            <span>CBAM Durumu: {CURRENT_COMPANY.cbamStatus}</span>
            <span>Toplam Emisyon: {totalEmission.toLocaleString('tr-TR')} tCO₂e</span>
            <span>Ortalama DQ: {avgDq}/100</span>
          </div>
        </div>

        <div className="company-readiness-card">
          <span>CBAM Hazırlık Skoru</span>
          <strong>%{CURRENT_COMPANY.readinessScore}</strong>
          <div className="readiness-track">
            <div
              className="readiness-fill"
              style={{ width: `${CURRENT_COMPANY.readinessScore}%` }}
            />
          </div>
          <small>
            Raporlama öncesi eksik veri ve onay adımları tamamlanmalı.
          </small>
        </div>
      </div>

      <div className="company-kpi-grid">
        <Kpi
          label="Toplam Ürün"
          value={COMPANY_PRODUCTS.length}
          sub="CBAM kapsamındaki ürün"
          icon="🏭"
          tone="green"
        />

        <Kpi
          label="Tamamlanan"
          value={completed}
          sub="Hesaplama tamamlandı"
          icon="✅"
          tone="blue"
        />

        <Kpi
          label="Eksik Veri"
          value={missing}
          sub="Tamamlanması gerekiyor"
          icon="⚠️"
          tone="orange"
        />

        <Kpi
          label="Onay Bekleyen"
          value={COMPANY_APPROVALS.length}
          sub="Yönetici onayı gerekli"
          icon="📝"
          tone="purple"
        />

        <Kpi
          label="Kritik Risk"
          value={critical}
          sub="Öncelikli inceleme"
          icon="🚨"
          tone="red"
        />

        <Kpi
          label="Ortalama DQ"
          value={avgDq}
          sub="Veri kalite skoru"
          icon="🎯"
          tone="yellow"
        />
      </div>

      <div className="company-dashboard-grid pro">
        <div className="card dashboard-panel">
          <div className="panel-header">
            <div>
              <h3 className="section-title">Ürün Bazlı Emisyon Özeti</h3>
              <p>Ürünlerin CBAM hesaplama sonucu, veri kalitesi ve risk durumu</p>
            </div>

            <button className="btn btn-primary btn-sm">Yeni Hesaplama</button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="company-product-table">
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>CN</th>
                  <th>Miktar</th>
                  <th>Toplam Emisyon</th>
                  <th>Spesifik</th>
                  <th>DQ</th>
                  <th>Risk</th>
                  <th>Durum</th>
                </tr>
              </thead>

              <tbody>
                {COMPANY_PRODUCTS.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                    </td>
                    <td>{p.cnCode}</td>
                    <td>{p.productionAmount} ton</td>
                    <td>
                      <strong>{p.totalEmission.toLocaleString('tr-TR')} tCO₂e</strong>
                    </td>
                    <td>{p.specificEmission} tCO₂e/ton</td>
                    <td>
                      <DataQualityBar value={p.dataQuality} />
                    </td>
                    <td>
                      <span className={getRiskClass(p.risk)}>{p.risk}</span>
                    </td>
                    <td>
                      <span className={`company-status-pill-2 ${getStatusClass(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card ai-panel">
          <div className="ai-panel-header">
            <span>✨</span>
            <div>
              <h3 className="section-title">AI Karbon Azaltım Önerileri</h3>
              <p>Firma verilerine göre öncelikli iyileştirme alanları</p>
            </div>
          </div>

          <div className="recommendation-list">
            {AI_RECOMMENDATIONS.map((item, index) => (
              <div key={item.id} className="recommendation-card pro">
                <div className="recommendation-top">
                  <span>{index + 1}</span>
                  <strong>{item.title}</strong>
                </div>

                <p>{item.text}</p>

                <div className="recommendation-impact">
                  Etki: <strong>{item.impact}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card dashboard-panel" style={{ marginTop: 16 }}>
        <div className="panel-header">
          <div>
            <h3 className="section-title">Veri Giriş Durumu</h3>
            <p>Operasyon kullanıcılarına atanmış veri giriş görevlerinin takibi</p>
          </div>

          <button className="btn btn-outline btn-sm">Görev Ata</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-task-table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Veri Kategorisi</th>
                <th>Sorumlu</th>
                <th>Durum</th>
                <th>Son Tarih</th>
                <th>Veri Kalitesi</th>
                <th>Aksiyon</th>
              </tr>
            </thead>

            <tbody>
              {COMPANY_DATA_TASKS.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.product}</strong>
                  </td>
                  <td>{task.category}</td>
                  <td>{task.responsible}</td>
                  <td>
                    <span className={`company-status-pill-2 ${getStatusClass(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td>{task.dueDate}</td>
                  <td>
                    <DataQualityBar value={task.quality} />
                  </td>
                  <td>
                    <button className="btn btn-outline btn-sm">İncele</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  )
}