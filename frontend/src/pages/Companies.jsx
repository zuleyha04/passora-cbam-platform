import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'

import PageContainer from '../components/layout/PageContainer'
import { MOCK_COMPANIES } from '../data/mockData'

const STATUS_COLORS = {
  'Veri Toplanıyor': '#D97706',
  'Hesaplama Tamamlandı': '#16A34A',
  'Onay Bekliyor': '#EA580C',
  'Raporlandı': '#0D7A5F',
  'Hazırlıkta': '#64748B',
}

const RISK_COLORS = {
  critical: '#DC2626',
  high: '#EA580C',
  medium: '#D97706',
  low: '#16A34A',
  Kritik: '#DC2626',
  Yüksek: '#EA580C',
  Orta: '#D97706',
  Düşük: '#16A34A',
}

function getRiskLabel(risk) {
  const value = String(risk || '').toLowerCase()

  if (value.includes('critical') || value.includes('kritik')) return 'Kritik'
  if (value.includes('high') || value.includes('yüksek')) return 'Yüksek'
  if (value.includes('medium') || value.includes('orta')) return 'Orta'
  if (value.includes('low') || value.includes('düşük')) return 'Düşük'

  return 'Belirsiz'
}

function getCompanyStatus(company) {
  return (
    company.cbam_status ||
    company.cbamStatus ||
    company.status ||
    'Veri Toplanıyor'
  )
}

function getCompanyRisk(company) {
  return getRiskLabel(company.risk_level || company.risk || company.riskLevel)
}

function groupCount(items, getter) {
  const map = {}

  items.forEach((item) => {
    const key = getter(item)
    map[key] = (map[key] || 0) + 1
  })

  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

function formatEmission(value) {
  if (value === undefined || value === null) return '-'
  return Number(value).toLocaleString('tr-TR')
}

function getDqColor(score) {
  const value = Number(score || 0)

  if (value >= 80) return '#16A34A'
  if (value >= 65) return '#D97706'
  return '#DC2626'
}

function getRiskBadgeClass(risk) {
  const value = String(risk || '').toLowerCase()

  if (value.includes('kritik') || value.includes('critical')) return 'badge badge-critical'
  if (value.includes('yüksek') || value.includes('high')) return 'badge badge-high'
  if (value.includes('orta') || value.includes('medium')) return 'badge badge-medium'
  if (value.includes('düşük') || value.includes('low')) return 'badge badge-low'

  return 'badge badge-medium'
}

function ChartCard({ title, subtitle, data, colorMap }) {
  return (
    <div className="company-chart-card">
      <div className="company-chart-header">
        <div>
          <h3>{title}</h3>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="company-chart-body">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={colorMap[entry.name] || '#94A3B8'}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, name) => [`${value} firma`, name]}
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #E2E8F0',
                fontSize: 12,
              }}
            />

            <Legend
              verticalAlign="bottom"
              height={32}
              iconType="circle"
              wrapperStyle={{
                fontSize: 11,
                color: '#64748B',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default function Companies() {
  const companies = MOCK_COMPANIES

  const statusData = groupCount(companies, getCompanyStatus)
  const riskData = groupCount(companies, getCompanyRisk)

  return (
    <PageContainer title="Firmalar" subtitle="Firma bazlı CBAM uyum takibi">
      <div className="companies-summary-grid">
        <div className="company-summary-card">
          <span>Toplam Firma</span>
          <strong>{companies.length}</strong>
          <small>Passora’ya kayıtlı müşteri firma</small>
        </div>

        <div className="company-summary-card">
          <span>Kritik/Yüksek Risk</span>
          <strong>
            {
              companies.filter((company) => {
                const risk = getCompanyRisk(company)
                return risk === 'Kritik' || risk === 'Yüksek'
              }).length
            }
          </strong>
          <small>Öncelikli takip gerektiren firma</small>
        </div>

        <div className="company-summary-card">
          <span>Ortalama DQ</span>
          <strong>
            {Math.round(
              companies.reduce(
                (sum, company) =>
                  sum +
                  Number(
                    company.avg_dq_score ||
                      company.avgDqScore ||
                      company.dq_score ||
                      0
                  ),
                0
              ) / companies.length
            )}
          </strong>
          <small>Genel veri kalite skoru</small>
        </div>
      </div>

      <div className="companies-chart-grid">
        <ChartCard
          title="CBAM Durum Dağılımı"
          subtitle="Firmaların süreç aşamasına göre dağılımı"
          data={statusData}
          colorMap={STATUS_COLORS}
        />

        <ChartCard
          title="Risk Seviyesi Dağılımı"
          subtitle="Firmaların risk sınıflarına göre dağılımı"
          data={riskData}
          colorMap={RISK_COLORS}
        />
      </div>

      <div className="card">
        <div className="companies-table-header">
          <div>
            <h3>Tüm Firmalar</h3>
            <p>{companies.length} firma kayıtlı</p>
          </div>

          <button className="btn btn-primary btn-sm">
            Yeni Firma Ekle
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Firma Adı</th>
                <th>Sektör</th>
                <th>Ürün Sayısı</th>
                <th>Toplam Emisyon</th>
                <th>Ort. DQ Skoru</th>
                <th>Risk Seviyesi</th>
                <th>CBAM Durumu</th>
                <th>Son Hesaplama</th>
                <th>Aksiyon</th>
              </tr>
            </thead>

            <tbody>
              {companies.map((company) => {
                const dq =
                  company.avg_dq_score ||
                  company.avgDqScore ||
                  company.dq_score ||
                  0

                const risk = getCompanyRisk(company)
                const status = getCompanyStatus(company)

                return (
                  <tr key={company.id || company.name}>
                    <td>
                      <strong>
                        {company.name || company.company_name}
                      </strong>
                    </td>

                    <td>
                      {company.sector || company.sub_sector || '-'}
                    </td>

                    <td>
                      {company.product_count || company.productCount || 0}
                    </td>

                    <td>
                      <strong>
                        {formatEmission(
                          company.total_emission ||
                            company.totalEmission ||
                            company.total_emission_tco2e
                        )}{' '}
                        tCO₂e
                      </strong>
                    </td>

                    <td>
                      <div className="dq-mini">
                        <div className="dq-mini-track">
                          <div
                            className="dq-mini-fill"
                            style={{
                              width: `${dq}%`,
                              background: getDqColor(dq),
                            }}
                          />
                        </div>
                        <span>{dq}</span>
                      </div>
                    </td>

                    <td>
                      <span className={getRiskBadgeClass(risk)}>
                        {risk}
                      </span>
                    </td>

                    <td>
                      <span className="company-status-pill">
                        {status}
                      </span>
                    </td>

                    <td>
                      {company.last_calculation ||
                        company.lastCalculation ||
                        company.last_report_date ||
                        '-'}
                    </td>

                    <td>
                      <button className="btn btn-outline btn-sm">
                        Detay
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  )
}