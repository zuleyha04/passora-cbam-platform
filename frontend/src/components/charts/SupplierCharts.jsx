import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, ComposedChart, Line, Legend,
} from 'recharts'

const SUPPLIER_COLORS = ['#64748B', '#3B82F6', '#16A34A', '#EF4444']

export function SupplierEmissionChart({ rows }) {
  if (!rows || rows.length === 0) return null
  const data = rows.map((r) => ({ name: r.supplier_name, emission: r.total_emission_tco2e }))

  return (
    <div className="card">
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Tedarikçiye Göre Toplam Emisyon (tCO₂e)
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => [`${v.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} tCO₂e`]} />
          <Bar dataKey="emission" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={SUPPLIER_COLORS[i % SUPPLIER_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SupplierCostCarbonChart({ rows }) {
  if (!rows || rows.length === 0) return null
  const data = rows.map((r) => ({
    name: r.supplier_name,
    maliyet: r.total_cost,
    emisyon: r.total_emission_tco2e,
  }))

  return (
    <div className="card">
      <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        Maliyet & Emisyon Karşılaştırması
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 12 }} orientation="left" />
          <YAxis yAxisId="right" tick={{ fontSize: 12 }} orientation="right" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="maliyet" name="Maliyet (₺)" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" dataKey="emisyon" name="Emisyon (tCO₂e)" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CarbonSavingCard({ savingTco2e, note }) {
  if (!savingTco2e || savingTco2e <= 0) return null
  return (
    <div className="card" style={{ background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', border: '1px solid #BBF7D0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 32 }}>🌿</span>
        <div>
          <p style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>Potansiyel Karbon Azaltımı</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: '#16A34A' }}>
            {savingTco2e.toLocaleString('tr-TR', { maximumFractionDigits: 0 })} tCO₂e
          </p>
          <p style={{ fontSize: 12, color: '#166534' }}>{note}</p>
        </div>
      </div>
    </div>
  )
}
