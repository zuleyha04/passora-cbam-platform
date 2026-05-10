import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, PieChart, Pie, Legend,
} from 'recharts'
import { getRiskConfig } from '../../utils/riskHelpers'

export function AdminRiskDistributionChart({ reports }) {
  if (!reports || reports.length === 0) return null
  const counts = { low: 0, medium: 0, high: 0, critical: 0 }
  reports.forEach(r => { if (counts[r.risk_level] !== undefined) counts[r.risk_level]++ })

  const data = Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([level, count]) => {
      const cfg = getRiskConfig(level)
      return { name: cfg.label, value: count, color: cfg.color }
    })

  return (
    <div className="card">
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Risk Seviyesi Dağılımı
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AdminEmissionByCompanyChart({ reports }) {
  if (!reports || reports.length === 0) return null
  const byCompany = {}
  reports.forEach(r => {
    const name = r.company_name.split(' ').slice(0, 2).join(' ')
    byCompany[name] = (byCompany[name] || 0) + r.total_emission_tco2e
  })
  const data = Object.entries(byCompany).map(([name, value]) => ({ name, value: Math.round(value) }))

  return (
    <div className="card">
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Firmalara Göre Toplam Emisyon (tCO₂e)
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => `${v.toLocaleString('tr-TR')} tCO₂e`} />
          <Bar dataKey="value" fill="#0D7A5F" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AdminModeDistributionChart({ distribution }) {
  if (!distribution) return null
  const labels = { actual_data: 'Actual Data', epd_benchmark: 'EPD Benchmark', hybrid: 'Hybrid' }
  const colors = { actual_data: '#0D7A5F', epd_benchmark: '#3B82F6', hybrid: '#F59E0B' }
  const data = Object.entries(distribution).map(([key, value]) => ({
    name: labels[key] || key, value, color: colors[key] || '#64748B',
  }))

  return (
    <div className="card">
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Hesaplama Modu Dağılımı
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
