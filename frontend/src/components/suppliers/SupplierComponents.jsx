import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, ComposedChart, Line, Legend,
} from 'recharts'

const COLORS = ['#64748B', '#3B82F6', '#16A34A', '#EF4444']

export function SupplierScenarioTable({ rows }) {
  if (!rows || rows.length === 0) return null
  const current = rows.find(r => r.is_current)
  const currentEmission = current ? current.amount_ton * current.emission_factor_tco2e_per_ton : 0
  const currentCost = current ? current.amount_ton * current.price_per_ton : 0

  const STATUS = {
    best:      { label: 'En Düşük Karbon', color: '#166534', bg: '#DCFCE7' },
    good:      { label: 'Dengeli',          color: '#1E40AF', bg: '#DBEAFE' },
    reference: { label: 'Mevcut Tedarikçi', color: '#64748B', bg: '#F1F5F9' },
    high_risk: { label: 'Yüksek Risk',      color: '#991B1B', bg: '#FEE2E2' },
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F8FAFC' }}>
            {['Tedarikçi','Hammadde','Karbon Katsayısı','Toplam Emisyon','Emisyon Farkı','Ton Fiyatı','Toplam Maliyet','Maliyet Farkı','Çevre Beyanı','Durum'].map(h => (
              <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#94A3B8', textAlign: 'left', whiteSpace: 'nowrap', borderBottom: '1px solid #E2E8F0' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => {
            const emission = r.amount_ton * r.emission_factor_tco2e_per_ton
            const cost = r.amount_ton * r.price_per_ton
            const diffE = r.is_current ? 0 : emission - currentEmission
            const diffC = r.is_current ? 0 : cost - currentCost
            const status = r.is_current ? 'reference' : diffE < -400 ? 'best' : diffE < 0 ? 'good' : 'high_risk'
            const s = STATUS[status]
            return (
              <tr key={r.id} style={{ borderBottom: '1px solid #F1F5F9', background: r.is_current ? '#FAFBFC' : '#fff' }}>
                <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: r.is_current ? 700 : 500, color: '#1E293B' }}>{r.name}</td>
                <td style={{ padding: '12px 14px', fontSize: 13, color: '#475569' }}>{r.material}</td>
                <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600 }}>{r.emission_factor_tco2e_per_ton.toFixed(2)}</td>
                <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700 }}>{Math.round(emission).toLocaleString('tr-TR')} tCO₂e</td>
                <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 700, color: r.is_current ? '#94A3B8' : diffE < 0 ? '#16A34A' : '#DC2626' }}>
                  {r.is_current ? '–' : `${diffE > 0 ? '+' : ''}${Math.round(diffE).toLocaleString('tr-TR')}`}
                </td>
                <td style={{ padding: '12px 14px', fontSize: 13 }}>{r.price_per_ton.toLocaleString('tr-TR')} ₺</td>
                <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600 }}>{Math.round(cost).toLocaleString('tr-TR')} ₺</td>
                <td style={{ padding: '12px 14px', fontSize: 13, color: r.is_current ? '#94A3B8' : diffC > 0 ? '#DC2626' : '#16A34A' }}>
                  {r.is_current ? '–' : `${diffC > 0 ? '+' : ''}${Math.round(diffC).toLocaleString('tr-TR')} ₺`}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, fontWeight: 600, background: r.has_epd ? '#DCFCE7' : '#F1F5F9', color: r.has_epd ? '#166534' : '#64748B' }}>
                    {r.has_epd ? '✓ Var' : '✗ Yok'}
                  </span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: 11, padding: '2px 10px', borderRadius: 99, fontWeight: 700, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>{s.label}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function SupplierEmissionChart({ rows }) {
  const data = rows.map(r => ({ name: r.name, value: Math.round(r.amount_ton * r.emission_factor_tco2e_per_ton) }))
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '20px 22px' }}>
      <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Tedarikçiye Göre Emisyon</p>
      <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>tCO₂e</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={36}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={v => [`${v.toLocaleString('tr-TR')} tCO₂e`]} contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          <Bar dataKey="value" radius={[6,6,0,0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SupplierCostEmissionChart({ rows }) {
  const data = rows.map(r => ({
    name: r.name,
    maliyet: Math.round(r.amount_ton * r.price_per_ton),
    emisyon: Math.round(r.amount_ton * r.emission_factor_tco2e_per_ton),
  }))
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '20px 22px' }}>
      <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Maliyet & Emisyon Karşılaştırması</p>
      <p style={{ fontSize: 12, color: '#94A3B8', marginBottom: 16 }}>₺ maliyet (çubuk) – tCO₂e emisyon (çizgi)</p>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} orientation="left" />
          <YAxis yAxisId="right" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} orientation="right" />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar yAxisId="left" dataKey="maliyet" name="Maliyet (₺)" fill="#3B82F6" radius={[6,6,0,0]} barSize={32} />
          <Line yAxisId="right" dataKey="emisyon" name="Emisyon (tCO₂e)" stroke="#EF4444" strokeWidth={2.5} dot={{ r: 5, fill: '#EF4444' }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
