import { useApp } from '../context/AppContext';
import { formatEur, formatNum, formatTCO2, SECTOR_BENCHMARKS } from '../engine/cbam';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import styles from './Dashboard.module.css';

const CBAM_STEPS = [
  { n: '01', label: 'Firma Kaydı',       desc: 'Şirket & tesis bilgileri', done: true },
  { n: '02', label: 'Ürün / CN Kodu',    desc: 'Çelik ürün tanımı',        done: true },
  { n: '03', label: 'Veri Girişi',       desc: 'Yakıt, elektrik, precursor', done: true },
  { n: '04', label: 'Hesaplama',         desc: 'CBAM emisyon hesabı',      done: false },
  { n: '05', label: 'Simülasyon',        desc: 'Tedarikçi senaryosu',      done: false },
  { n: '06', label: 'Rapor & Beyan',     desc: 'AB uyumlu çıktı',          done: false },
];

const CBAM_SECTORS = [
  { icon: '⚙️', label: 'Demir-Çelik',  active: true  },
  { icon: '🏗️', label: 'Çimento',      active: false },
  { icon: '🔩', label: 'Alüminyum',    active: false },
  { icon: '🌿', label: 'Gübre',        active: false },
  { icon: '⚡', label: 'Elektrik',     active: false },
  { icon: '💧', label: 'Hidrojen',     active: false },
];

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const { result, company, production, period, etsPrice } = state;

  const trendData = [
    { q: '2023-Q4', cost: 0, emission: 0 },
    { q: '2024-Q1', cost: 72000, emission: 960 },
    { q: '2024-Q2', cost: 81000, emission: 1080 },
    { q: '2024-Q3', cost: 75000, emission: 1000 },
    { q: '2024-Q4', cost: 88500, emission: 1180 },
    { q: '2025-Q1', cost: result?.cbamCostEur ?? 95000, emission: result?.totalEmbedded ?? 1260 },
  ];

  const benchmarkData = Object.values(SECTOR_BENCHMARKS).map(b => ({
    name: b.label,
    value: b.specific,
    fill: b.color,
  }));
  if (result) {
    benchmarkData.push({ name: 'Sizin Değeriniz', value: result.specificEmbedded, fill: '#3b82f6' });
  }

  const breakdownData = result ? [
    { name: 'Doğrudan\n(Yakıt)', value: result.directFuel },
    { name: 'Dolaylı\n(Elektrik)', value: result.electricity },
    { name: 'Precursor\n(Ham.)', value: result.precursorTotal },
    { name: 'Taşıma', value: result.transportTotal },
  ] : [];

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>CBAM Dashboard</h1>
          <p className={styles.subtitle}>{company.name} · {period} · {company.city}</p>
        </div>
        <div className={styles.headerActions}>
          <span className="badge badge-accent">🟢 Aktif Dönem: {period}</span>
          <button className="btn btn-primary btn-sm"
            onClick={() => { dispatch({ type: 'CALCULATE' }); dispatch({ type: 'SET_TAB', payload: 'calculator' }); }}>
            ⚗ Hesapla
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiGrid}>
        <div className={`stat-card ${styles.kpiPrimary}`}>
          <div className="stat-label">Toplam Emisyon</div>
          <div className="stat-value" style={{ color: 'var(--color-primary)' }}>
            {result ? formatNum(result.totalEmbedded, 1) : '—'}
          </div>
          <div className="stat-unit">tCO₂e</div>
          {result && <div className={styles.kpiSub}>Spesifik: {result.specificEmbedded.toFixed(4)} tCO₂e/ton</div>}
        </div>

        <div className={`stat-card ${styles.kpiDanger}`}>
          <div className="stat-label">CBAM Maliyet</div>
          <div className="stat-value" style={{ color: 'var(--color-danger)' }}>
            {result ? formatEur(result.cbamCostEur) : '—'}
          </div>
          <div className="stat-unit">@ €{etsPrice}/tCO₂e</div>
          {result && <div className={styles.kpiSub}>{formatNum(result.certificatesRequired, 1)} sertifika</div>}
        </div>

        <div className={`stat-card ${styles.kpiAccent}`}>
          <div className="stat-label">EPD Benchmark</div>
          <div className="stat-value" style={{ color: result?.status === 'above' ? 'var(--color-danger)' : 'var(--color-accent)' }}>
            {result ? (result.status === 'above' ? '▲ Üstünde' : '▼ Altında') : '—'}
          </div>
          <div className="stat-unit">Kardemir EPD: 2.29 tCO₂e/ton</div>
          {result && <div className={styles.kpiSub}>Fark: {result.diffVsEpd > 0 ? '+' : ''}{result.diffVsEpd.toFixed(4)} tCO₂e/ton</div>}
        </div>

        <div className="stat-card">
          <div className="stat-label">Üretim Miktarı</div>
          <div className="stat-value">{formatNum(production, 0)}</div>
          <div className="stat-unit">ton · {period}</div>
          <div className={styles.kpiSub}>CN Kodu: 7216 (Profil)</div>
        </div>
      </div>

      {/* Default value warning */}
      {(!result || result.isDefaultUsed) && (
        <div className={`alert alert-warning ${styles.defaultWarning}`}>
          <span>⚠️</span>
          <div>
            <strong>Tahmini/Varsayılan Değer</strong> — Gerçek enerji verisi girilmedi.
            AB varsayılan değerleri kullanılıyor. Gerçek veri ile %30-60 maliyet azaltımı mümkün.
            <button className="btn btn-ghost btn-sm" style={{ marginLeft: 12 }}
              onClick={() => dispatch({ type: 'SET_TAB', payload: 'calculator' })}>
              Veri Gir →
            </button>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        {/* Trend */}
        <div className={`card ${styles.chartCard}`}>
          <div className={styles.chartTitle}>📈 Çeyreklik CBAM Maliyet Trendi</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="q" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tickFormatter={v => `€${(v/1000).toFixed(0)}K`} tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: unknown) => [formatEur(v as number), 'CBAM Maliyet']}
              />
              <Area type="monotone" dataKey="cost" stroke="#3b82f6" fill="url(#costGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Benchmark */}
        <div className={`card ${styles.chartCard}`}>
          <div className={styles.chartTitle}>📊 Sektör Benchmark Karşılaştırması</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={benchmarkData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" tickFormatter={v => `${v}`} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                formatter={(v: unknown) => [`${(v as number).toFixed(3)} tCO₂e/ton`]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {benchmarkData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Emission Breakdown */}
      {result && breakdownData.length > 0 && (
        <div className={`card ${styles.breakdownCard}`}>
          <div className={styles.chartTitle}>🔬 Emisyon Bileşen Analizi (Bağımlı / Bağımsız)</div>
          <div className={styles.breakdownGrid}>
            <div className={styles.breakdownBars}>
              {breakdownData.map((d, i) => {
                const pct = (d.value / result.totalEmbedded) * 100;
                const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
                return (
                  <div key={i} className={styles.breakdownBar}>
                    <div className={styles.breakdownLabel}>{d.name.replace('\n', ' ')}</div>
                    <div className={styles.breakdownTrack}>
                      <div className={styles.breakdownFill} style={{ width: `${pct}%`, background: colors[i] }} />
                    </div>
                    <div className={styles.breakdownValue}>{d.value.toFixed(2)}</div>
                    <div className={styles.breakdownPct}>{pct.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
            <div className={styles.depIndBox}>
              <div className={styles.depItem}>
                <div className={styles.depLabel}>🔗 Bağımlı Emisyon</div>
                <div className={styles.depValue}>{formatTCO2(result.dependentEmissions)}</div>
                <div className={styles.depHint}>Grid elektrik (dış kaynak)</div>
              </div>
              <div className={styles.depItem}>
                <div className={styles.depLabel}>🔋 Bağımsız Emisyon</div>
                <div className={styles.depValue}>{formatTCO2(result.independentEmissions)}</div>
                <div className={styles.depHint}>Yerinde üretim & yakıt</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CBAM Process Steps */}
      <div className="card">
        <div className={styles.chartTitle}>🗺️ CBAM Uyum Süreci Basamakları</div>
        <div className={styles.steps}>
          {CBAM_STEPS.map((step, i) => (
            <div key={i} className={`${styles.step} ${step.done ? styles.stepDone : styles.stepPending}`}>
              <div className={styles.stepNum}>{step.done ? '✓' : step.n}</div>
              <div className={styles.stepLabel}>{step.label}</div>
              <div className={styles.stepDesc}>{step.desc}</div>
              {i < CBAM_STEPS.length - 1 && <div className={styles.stepArrow}>→</div>}
            </div>
          ))}
        </div>
      </div>

      {/* CBAM Sectors & Green Deal */}
      <div className={styles.bottomRow}>
        <div className="card">
          <div className={styles.chartTitle}>🌍 CBAM Kapsamındaki Sektörler</div>
          <div className={styles.sectorGrid}>
            {CBAM_SECTORS.map((s, i) => (
              <div key={i} className={`${styles.sectorChip} ${s.active ? styles.sectorActive : styles.sectorInactive}`}>
                <span>{s.icon}</span>
                <span>{s.label}</span>
                {s.active && <span className={styles.sectorBadge}>Aktif</span>}
              </div>
            ))}
          </div>
          <div className={styles.greenDeal}>
            <div className={styles.greenDealTitle}>🇪🇺 Green Deal ↔ CBAM İlişkisi</div>
            <div className={styles.greenDealText}>
              AB'nin 2050 Karbon Nötr hedefi (Green Deal) kapsamında, AB içi ve AB dışı üreticiler arasında
              eşit rekabet koşulları sağlamak için CBAM devreye girmiştir. İthal ürünlerdeki gömülü emisyon,
              AB ETS fiyatı üzerinden sertifika satın alınarak dengelenir.
              <br /><br />
              <strong style={{ color: 'var(--color-primary)' }}>Türkiye Durumu:</strong> Türkiye'nin %70 EAF (hurda bazlı) çelik üretimi,
              AB default değerlerinin altında olup gerçek veri bildirimi büyük maliyet avantajı sağlar.
            </div>
          </div>
        </div>

        <div className="card">
          <div className={styles.chartTitle}>📌 Önemli Tarihler</div>
          <div className={styles.timeline}>
            {[
              { date: '01.01.2026', event: 'Kesin Rejim Başlangıcı', status: 'done', color: 'var(--color-accent)' },
              { date: '31.03.2026', event: 'ACD Başvuru Son Tarihi', status: 'urgent', color: 'var(--color-warning)' },
              { date: '01.02.2027', event: 'CBAM Sertifika Satışı', status: 'upcoming', color: 'var(--color-primary)' },
              { date: '30.09.2027', event: 'İlk Yıllık Beyan (2026)', status: 'upcoming', color: 'var(--color-primary)' },
            ].map((t, i) => (
              <div key={i} className={styles.timelineItem}>
                <div className={styles.timelineDot} style={{ background: t.color }} />
                <div>
                  <div className={styles.timelineDate}>{t.date}</div>
                  <div className={styles.timelineEvent}>{t.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
