import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#DC2626', '#EA580C', '#0D7A5F', '#3B82F6']

export default function EmissionBarChart({ data }) {
  if (!data || data.length === 0) return null

  const max = Math.max(...data.map(d => d.value))

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: 14,
        padding: '18px 18px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        height: '100%',
        minHeight: 345,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ marginBottom: 14 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>
          Firma Emisyon Karşılaştırması
        </p>
        <p style={{ fontSize: 11, color: '#94A3B8' }}>
          tCO₂e — tüm dönemler toplamı
        </p>
      </div>

      <div style={{ flex: 1, minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 8, left: -18, bottom: 8 }}
            barSize={34}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

            <XAxis
              dataKey="name"
              tick={{ fontSize: 11, fill: '#64748B' }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />

            <YAxis
              tick={{ fontSize: 10, fill: '#94A3B8' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
            />

            <Tooltip
              formatter={v => [`${v.toLocaleString('tr-TR')} tCO₂e`, 'Emisyon']}
              labelStyle={{ fontWeight: 700, color: '#1E293B' }}
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                fontSize: 12,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />

            <Bar dataKey="value" radius={[7, 7, 0, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={COLORS[i % COLORS.length]}
                  opacity={d.value === max ? 1 : 0.72}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #F1F5F9' }}>
        <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.5 }}>
          En yüksek toplam emisyona sahip firma öncelikli inceleme adayıdır.
        </p>
      </div>
    </div>
  )
}