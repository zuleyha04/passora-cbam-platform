import { AlertTriangle, Trees } from 'lucide-react'
import { fmtNum } from '../../utils/formatters'

export function DefaultValueWarningCard({ warnings }) {
  if (!warnings || warnings.length === 0) return null
  return (
    <div className="alert alert-warning" style={{ flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
        <AlertTriangle size={16} />
        Varsayılan (Default) Değer Kullanıldı
      </div>
      <p style={{ fontSize: 12 }}>
        Bu alanda gerçek tesis verisi girilmediği için sistem varsayılan bir değer kullanmıştır.
        Varsayılan değerler ihtiyatlı seçildiğinden hesaplanan karbon emisyonu gerçek değerden yüksek görünebilir.
        Nihai CBAM raporlaması için gerçek tesis verisi girilmelidir.
      </p>
      <ul style={{ fontSize: 12, paddingLeft: 16 }}>
        {warnings.map((w, i) => (
          <li key={i} style={{ marginBottom: 2 }}>
            <strong>{w.field}</strong>: {w.message}
            {w.default_value !== undefined && ` (Kullanılan: ${w.default_value})`}
          </li>
        ))}
      </ul>
    </div>
  )
}

export function OffsetEquivalentCard({ data }) {
  if (!data) return null
  return (
    <div className="card" style={{ borderLeft: '4px solid #16A34A' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Trees size={20} color="#16A34A" />
        <h3 style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>Karbon Eşdeğerliği</h3>
      </div>
      <div style={{ display: 'flex', gap: 24, marginBottom: 10 }}>
        <div>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Fazla Emisyon</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-critical)' }}>
            {fmtNum(data.excess_emission_tco2e)} <span style={{ fontSize: 12, fontWeight: 400 }}>tCO₂e</span>
          </p>
        </div>
        <div>
          <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 2 }}>Gerekli Fidan (10 yıl)</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#16A34A' }}>
            {data.required_tree_seedlings_10_years?.toLocaleString('tr-TR')} 🌱
          </p>
        </div>
      </div>
      <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 6 }}>{data.note}</p>
      <div className="alert alert-info" style={{ fontSize: 11 }}>{data.disclaimer}</div>
    </div>
  )
}
