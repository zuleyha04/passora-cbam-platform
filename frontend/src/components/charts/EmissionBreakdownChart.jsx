import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'

const SOURCE_COLORS = {
  fuel: '#F97316',
  electricity: '#3B82F6',
  precursor: '#8B5CF6',
  transport: '#06B6D4',
}

const SOURCE_LABELS = {
  fuel: 'Yakıt',
  electricity: 'Elektrik',
  precursor: 'Precursor',
  transport: 'Taşıma',
}

export function EmissionBreakdownChart({ breakdown }) {
  if (!breakdown) return null
  const data = Object.entries({
    fuel: breakdown.fuel_emission_tco2e,
    electricity: breakdown.electricity_emission_tco2e,
    precursor: breakdown.precursor_emission_tco2e,
    transport: breakdown.transport_emission_tco2e,
  })
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({ name: SOURCE_LABELS[key], value: Math.round(value * 100) / 100, color: SOURCE_COLORS[key] }))

  return (
    <div className="card">
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Emisyon Kırılımı
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={(v) => [`${v.toLocaleString('tr-TR')} tCO₂e`]} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BenchmarkComparisonChart({ calculated, benchmark = 2.29 }) {
  const data = [
    { name: 'Hesaplanan', value: calculated, fill: calculated > benchmark ? '#EF4444' : '#16A34A' },
    { name: 'EPD Benchmark', value: benchmark, fill: '#3B82F6' },
  ]
  return (
    <div className="card">
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Benchmark Karşılaştırması (tCO₂e/ton)
      </h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => `${v.toFixed(2)} tCO₂e/ton`} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function EmissionSourcesBarChart({ breakdown }) {
  if (!breakdown) return null
  const data = [
    { name: 'Yakıt', value: breakdown.fuel_emission_tco2e, fill: SOURCE_COLORS.fuel },
    { name: 'Elektrik', value: breakdown.electricity_emission_tco2e, fill: SOURCE_COLORS.electricity },
    { name: 'Precursor', value: breakdown.precursor_emission_tco2e, fill: SOURCE_COLORS.precursor },
    { name: 'Taşıma', value: breakdown.transport_emission_tco2e, fill: SOURCE_COLORS.transport },
  ].filter(d => d.value > 0)

  return (
    <div className="card">
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Kaynaklara Göre Emisyon (tCO₂e)
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => [`${v.toLocaleString('tr-TR', { maximumFractionDigits: 1 })} tCO₂e`]} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
