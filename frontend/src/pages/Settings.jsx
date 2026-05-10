import PageContainer from '../components/layout/PageContainer'

const DEFAULTS = [
  { label: 'EPD Benchmark (Steel Profile)', value: '2.29 tCO₂e/ton', source: 'EPD-IES-0023407', note: 'A1-A3 GWP-GHG, geçerlilik: 2031-01-15' },
  { label: 'Onsite Elektrik EF', value: '1.80 kgCO₂e/kWh', source: 'CBAM Default', note: 'Tesis içi üretim için varsayılan' },
  { label: 'Grid Elektrik EF', value: '0.91 kgCO₂e/kWh', source: 'CBAM Default', note: 'Şebeke elektriği için varsayılan' },
  { label: 'Ortalama Elektrik EF', value: '1.45 kgCO₂e/kWh', source: 'CBAM Default', note: 'Ayrım yapılmayan durumlarda' },
  { label: 'Ağaç Soğurumu (10 yıl)', value: '0.133 tCO₂e/fidan', source: 'IPCC Referans', note: 'Farkındalık amaçlı eşdeğerlik hesabı' },
  { label: 'Oksidasyon Faktörü (varsayılan)', value: '0.99', source: 'CBAM Default', note: 'Kullanıcı girmezse uygulanır' },
  { label: 'Biyokütle Payı (varsayılan)', value: '0.00', source: 'CBAM Default', note: 'Kullanıcı girmezse uygulanır' },
  { label: 'Taşıma EF (varsayılan)', value: '0.062 kgCO₂e/ton-km', source: 'CBAM Default', note: 'Karayolu TIR taşımacılığı' },
]

export default function Settings() {
  return (
    <PageContainer title="Ayarlar" subtitle="Sistem katsayıları ve varsayılan değerler">
      <div className="alert alert-info" style={{ marginBottom: 24, fontSize: 13 }}>
        Bu katsayılar CBAM metodolojisine ve EPD kaynaklarına dayanmaktadır. MVP'de görüntüleme amaçlıdır;
        ileride tesis bazlı katsayı güncelleme özelliği eklenecektir.
      </div>

      <div className="card">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Sabit Katsayılar & Varsayılan Değerler</h3>
        <table>
          <thead>
            <tr>
              <th>Parametre</th>
              <th>Değer</th>
              <th>Kaynak</th>
              <th>Not</th>
            </tr>
          </thead>
          <tbody>
            {DEFAULTS.map((d, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 500 }}>{d.label}</td>
                <td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)' }}>{d.value}</span></td>
                <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{d.source}</td>
                <td style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{d.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Hesaplama Modları</h3>
        {[
          { mode: 'actual_data', label: 'Actual Data', desc: 'Kullanıcı gerçek tesis verilerini girer. Gerçek hesap yapılır. Resmi CBAM raporlaması için bu mod kullanılmalıdır.' },
          { mode: 'epd_benchmark', label: 'EPD Benchmark', desc: 'Kullanıcı detaylı veri girmezse sadece EPD benchmark üzerinden tahmini hesap yapılır. Bu mod resmi CBAM hesabı değildir.' },
          { mode: 'hybrid', label: 'Hybrid', desc: 'Bazı veriler kullanıcıdan gelir, eksik alanlar default/benchmark ile tamamlanır. Eksik alanlar açıkça gösterilir.' },
        ].map(({ mode, label, desc }) => (
          <div key={mode} style={{ padding: '12px 0', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <span style={{ fontFamily: 'monospace', fontSize: 12, padding: '2px 8px', borderRadius: 4, background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 700 }}>
                {mode}
              </span>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{label}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{desc}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Sistem Bilgisi</h3>
        <div className="grid-2">
          {[
            ['Platform', 'Passora CBAM MVP v1.0'],
            ['Backend', 'FastAPI + Python'],
            ['Frontend', 'React + Vite'],
            ['Metodoloji', 'CBAM Implementing Regulation (EU) 2023/1773'],
            ['EPD Standardı', 'ISO 14025, EN 15804+A2'],
            ['Veri Saklama', 'Mock JSON (PostgreSQL-ready)'],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{k}</p>
              <p style={{ fontSize: 13, fontWeight: 500 }}>{v}</p>
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
