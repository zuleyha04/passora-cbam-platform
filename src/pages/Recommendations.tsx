import { useApp } from '../context/AppContext';
import { formatEur } from '../engine/cbam';
import styles from './Recommendations.module.css';

const SEV_COLORS = { high: 'var(--color-danger)', medium: 'var(--color-warning)', low: 'var(--color-accent)' };
const CAT_ICONS  = { electricity: '⚡', fuel: '🔥', transport: '🚛', supplier: '🏭', epd: '📄', general: '💡' };

export default function Recommendations() {
  const { state, dispatch } = useApp();
  const { recommendations, result } = state;

  if (!result) {
    return (
      <div className={styles.recs}>
        <div className="card" style={{ textAlign: 'center', padding: '64px 32px', color: 'var(--color-text-2)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>✦</div>
          <div style={{ fontSize: '1rem', marginBottom: 8 }}>AI önerileri görmek için önce hesaplama yapın.</div>
          <button className="btn btn-primary" onClick={() => dispatch({ type: 'SET_TAB', payload: 'calculator' })}>
            ⚗ Hesaplamaya Git
          </button>
        </div>
      </div>
    );
  }

  const totalSavingEur = recommendations.reduce((s, r) => s + (r.potentialSavingEur ?? 0), 0);
  const totalSavingTco2 = recommendations.reduce((s, r) => s + (r.potentialSavingTco2e ?? 0), 0);
  const highCount = recommendations.filter(r => r.severity === 'high').length;

  return (
    <div className={styles.recs}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>✦ AI Destekli Öneri Paneli</h1>
          <p className={styles.sub}>Firma başına karbon ayak izi azaltma önerileri · Kural tabanlı + literatür kaynaklı</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => dispatch({ type: 'CALCULATE' })}>
          ↺ Yenile
        </button>
      </div>

      {/* Summary */}
      <div className={styles.summaryGrid}>
        <div className="stat-card">
          <div className="stat-label">Toplam Öneri</div>
          <div className="stat-value">{recommendations.length}</div>
          <div className="stat-unit">{highCount} yüksek öncelikli</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Potansiyel Tasarruf</div>
          <div className="stat-value" style={{ color: 'var(--color-accent)', fontSize: '1.4rem' }}>{formatEur(totalSavingEur)}</div>
          <div className="stat-unit">çeyreklik tahmini</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">CO₂ Azaltım Potansiyeli</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>{totalSavingTco2.toFixed(1)}</div>
          <div className="stat-unit">tCO₂e çeyreklik</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Sistem Durumu</div>
          <div className="stat-value" style={{ color: result.status === 'above' ? 'var(--color-danger)' : 'var(--color-accent)', fontSize: '1.1rem' }}>
            {result.status === 'above' ? '▲ EPD Üstünde' : '▼ EPD Altında'}
          </div>
          <div className="stat-unit">Spesifik: {result.specificEmbedded.toFixed(4)} tCO₂e/ton</div>
        </div>
      </div>

      {/* Recommendation cards */}
      <div className={styles.recList}>
        {recommendations.map((rec, i) => (
          <div key={rec.id} className={styles.recCard} style={{ animationDelay: `${i * 60}ms` }}>
            <div className={styles.recLeft}>
              <div className={styles.recIcon}>{CAT_ICONS[rec.category]}</div>
            </div>
            <div className={styles.recBody}>
              <div className={styles.recHeader}>
                <h3 className={styles.recTitle}>{rec.title}</h3>
                <div className={styles.recMeta}>
                  <span className={`badge ${rec.severity === 'high' ? 'badge-danger' : rec.severity === 'medium' ? 'badge-warning' : 'badge-accent'}`}>
                    {rec.severity === 'high' ? 'Yüksek' : rec.severity === 'medium' ? 'Orta' : 'Düşük'}
                  </span>
                  <span className="badge badge-ghost">{rec.source}</span>
                </div>
              </div>
              <p className={styles.recDesc}>{rec.description}</p>
              <div className={styles.recFooter}>
                <div className={styles.recSavings}>
                  {rec.potentialSavingTco2e !== undefined && (
                    <span className={styles.saving}>
                      🌱 {rec.potentialSavingTco2e.toFixed(2)} tCO₂e azaltım
                    </span>
                  )}
                  {rec.potentialSavingEur !== undefined && (
                    <span className={styles.saving} style={{ color: 'var(--color-accent)' }}>
                      💰 {formatEur(rec.potentialSavingEur)} tasarruf
                    </span>
                  )}
                </div>
                <div className={styles.recAction}>
                  <strong>→ Eylem:</strong> {rec.action}
                </div>
              </div>
            </div>
            <div className={styles.recSeverityBar} style={{ background: SEV_COLORS[rec.severity] }} />
          </div>
        ))}
      </div>

      {/* Operational tips */}
      <div className="card">
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 }}>
          🌱 Operasyonel Sürdürülebilirlik Önerileri
        </div>
        <div className={styles.tipsGrid}>
          {[
            { icon: '☀️', title: 'Güneş Enerjisi', desc: 'Yakın bölgedeki güneş potansiyeli değerlendirin. Çatı güneş paneli ile grid elektriği azaltın.' },
            { icon: '♻️', title: 'Hurda Oranı', desc: 'EAF hurda girdisini artırarak özgül emisyonu düşürün. Her %10 hurda artışı = ~%5 emisyon azalması.' },
            { icon: '🚂', title: 'Lojistik Modu', desc: 'DEFRA\'ya göre demiryolu, karayolundan %65 daha düşük emisyona sahip. Uzun mesafeli taşımada tercih edin.' },
            { icon: '📄', title: 'EPD Belgesi', desc: 'Tedarikçinizden EPD belgesi talep edin. Varsayılan değer cezasından kurtulun.' },
            { icon: '🔋', title: 'Enerji Verimliliği', desc: 'ISO 50001 enerji yönetim sistemi ile tüketimi izleyin ve optimize edin.' },
            { icon: '🤝', title: 'Tedarikçi Eğitimi', desc: 'Tedarikçilerinize CBAM veri girişi eğitimi verin. Doğru veri = düşük maliyet.' },
          ].map((t, i) => (
            <div key={i} className={styles.tip}>
              <div className={styles.tipIcon}>{t.icon}</div>
              <div className={styles.tipTitle}>{t.title}</div>
              <div className={styles.tipDesc}>{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div className="card">
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--color-text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
          📚 Veri Kaynakları
        </div>
        <div className={styles.sources}>
          {[
            { name: 'DEFRA', desc: 'UK Çevre, Gıda & Kırsal İşler Bakanlığı — Taşıma ve tarım emisyon faktörleri', url: 'https://www.gov.uk/government/collections/government-conversion-factors-for-company-reporting' },
            { name: 'AB CBAM', desc: 'Reg. (EU) 2023/956 · Uygulama Kılavuzu', url: 'https://taxation-customs.ec.europa.eu/carbon-border-adjustment-mechanism_en' },
            { name: 'EPD Turkey', desc: 'Çevresel Ürün Beyanı (EPD) doğrulanmış belgeler — Kardemir Steel Profiles A1-A3: 2.29 tCO₂e/ton', url: 'https://epditaly.it/epd/kardemir-steel-profiles/' },
            { name: 'IPCC 2006', desc: 'Ulusal Sera Gazı Envanterleri — Yakıt emisyon faktörleri', url: 'https://www.ipcc-nggip.iges.or.jp/public/2006gl/' },
            { name: 'TEIAS 2024', desc: 'Türkiye Elektrik Grid Emisyon Faktörü: 0.4437 tCO₂e/MWh', url: 'https://www.teias.gov.tr' },
          ].map((s, i) => (
            <div key={i} className={styles.source}>
              <span className="badge badge-primary" style={{ whiteSpace: 'nowrap' }}>{s.name}</span>
              <span className={styles.sourceDesc}>{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
