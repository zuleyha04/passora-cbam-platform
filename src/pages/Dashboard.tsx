import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { setResult } from '../store/cbamSlice';
import { calculateSteelEmissions, generateRecommendations, formatEur, formatNum, SECTOR_BENCHMARKS } from '../engine/cbam';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

const CBAM_STEPS = [
  { n: '01', label: 'Firma Kaydı',    done: true  },
  { n: '02', label: 'Ürün / CN Kodu', done: true  },
  { n: '03', label: 'Veri Girişi',    done: true  },
  { n: '04', label: 'Hesaplama',      done: false },
  { n: '05', label: 'Simülasyon',     done: false },
  { n: '06', label: 'Rapor & Beyan',  done: false },
];

const CBAM_SECTORS = [
  { icon: '⚙️', label: 'Demir-Çelik', active: true  },
  { icon: '🏗️', label: 'Çimento',     active: false },
  { icon: '🔩', label: 'Alüminyum',   active: false },
  { icon: '🌿', label: 'Gübre',       active: false },
  { icon: '⚡', label: 'Elektrik',    active: false },
  { icon: '💧', label: 'Hidrojen',    active: false },
];

export default function Dashboard() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const { result, company, production, period, etsPrice, fuels, electricity, precursors, transport, suppliers } = useAppSelector(s => s.cbam);

  const handleCalculate = () => {
    try {
      const res = calculateSteelEmissions(production, fuels, electricity, precursors, transport, etsPrice);
      const recs = generateRecommendations(res, production, suppliers);
      dispatch(setResult({ result: res, recommendations: recs }));
      navigate('/calculator');
    } catch {}
  };

  const trendData = [
    { q: '2024-Q1', cost: 72000 }, { q: '2024-Q2', cost: 81000 },
    { q: '2024-Q3', cost: 75000 }, { q: '2024-Q4', cost: 88500 },
    { q: '2025-Q1', cost: result?.cbamCostEur ?? 95000 },
  ];

  const benchmarkData = [
    ...Object.values(SECTOR_BENCHMARKS).map(b => ({ name: b.label, value: b.specific, fill: b.color })),
    ...(result ? [{ name: 'Sizin Değeriniz', value: result.specificEmbedded, fill: '#3b82f6' }] : []),
  ];

  return (
    <div className="flex flex-col gap-5 p-6 max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gradient">CBAM Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">{company.name} · {period} · {company.city}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="badge badge-accent">🟢 Aktif: {period}</span>
          <button className="btn btn-primary btn-sm" onClick={handleCalculate}>⚡ Hesapla</button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3">
        {/* Toplam */}
        <div className="stat-card before:opacity-100">
          <div className="stat-label">Toplam Emisyon</div>
          <div className="stat-value text-primary">{result ? formatNum(result.totalEmbedded, 1) : '—'}</div>
          <div className="stat-unit">tCO₂e</div>
          {result && <div className="text-[10px] text-slate-500 mt-1">Spesifik: {result.specificEmbedded.toFixed(4)}</div>}
        </div>
        {/* Maliyet */}
        <div className="stat-card" style={{ '--tw-border-opacity': 0 } as React.CSSProperties}>
          <div className="stat-label">CBAM Maliyet</div>
          <div className="stat-value text-red-400">{result ? formatEur(result.cbamCostEur) : '—'}</div>
          <div className="stat-unit">@ €{etsPrice}/tCO₂e</div>
          {result && <div className="text-[10px] text-slate-500 mt-1">{formatNum(result.certificatesRequired, 1)} sertifika</div>}
        </div>
        {/* EPD */}
        <div className="stat-card">
          <div className="stat-label">EPD Durumu</div>
          <div className={`stat-value ${result?.status === 'above' ? 'text-red-400' : result?.status === 'below' ? 'text-emerald-400' : 'text-slate-400'}`}>
            {result ? (result.status === 'above' ? '▲ Üstünde' : '▼ Altında') : '—'}
          </div>
          <div className="stat-unit">Kardemir EPD: 2.29 tCO₂e/ton</div>
          {result && <div className="text-[10px] text-slate-500 mt-1">Fark: {result.diffVsEpd > 0 ? '+' : ''}{result.diffVsEpd.toFixed(4)}</div>}
        </div>
        {/* Üretim */}
        <div className="stat-card">
          <div className="stat-label">Üretim</div>
          <div className="stat-value">{formatNum(production, 0)}</div>
          <div className="stat-unit">ton · {period}</div>
          <div className="text-[10px] text-slate-500 mt-1">CN: 7216 Profil</div>
        </div>
      </div>

      {/* Warning */}
      {(!result || result.isDefaultUsed) && (
        <div className="alert alert-warning">
          <span>⚠️</span>
          <div className="flex-1">
            <strong>Varsayılan Değer</strong> — Gerçek enerji verisi girilmedi. AB default değerleri kullanılıyor.
            Gerçek veri ile %30-60 maliyet azaltımı mümkün.
          </div>
          <button className="btn btn-ghost btn-sm flex-shrink-0" onClick={() => navigate('/calculator')}>
            Veri Gir →
          </button>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">📈 Çeyreklik CBAM Maliyet Trendi</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="q" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tickFormatter={v => `€${((v as number)/1000).toFixed(0)}K`} tick={{ fill: '#64748b', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }}
                formatter={(v: unknown) => [formatEur(v as number), 'Maliyet']}
              />
              <Area type="monotone" dataKey="cost" stroke="#3b82f6" fill="url(#cg)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">📊 Sektör Benchmark Karşılaştırması</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={benchmarkData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis type="category" dataKey="name" width={85} tick={{ fill: '#94a3b8', fontSize: 9 }} />
              <Tooltip
                contentStyle={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }}
                formatter={(v: unknown) => [`${(v as number).toFixed(3)} tCO₂e/ton`]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {benchmarkData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdown (if calculated) */}
      {result && (
        <div className="card">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">🔬 Emisyon Bileşen Analizi</div>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-3">
              {[
                { label: 'Doğrudan (Yakıt)',    value: result.directFuel,     color: '#3b82f6' },
                { label: 'Dolaylı (Elektrik)',   value: result.electricity,    color: '#10b981' },
                { label: 'Precursor (Ham.)',      value: result.precursorTotal, color: '#f59e0b' },
                { label: 'Taşıma',              value: result.transportTotal, color: '#8b5cf6' },
              ].map((d, i) => {
                const pct = result.totalEmbedded > 0 ? (d.value / result.totalEmbedded) * 100 : 0;
                return (
                  <div key={i} className="grid grid-cols-[120px_1fr_60px_40px] items-center gap-2">
                    <div className="text-xs text-slate-400 truncate">{d.label}</div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: `${pct}%`, background: d.color }} />
                    </div>
                    <div className="text-xs font-mono text-slate-200 text-right">{d.value.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-500 text-right">{pct.toFixed(1)}%</div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: '🔗 Bağımlı Emisyon', value: result.dependentEmissions, hint: 'Grid elektrik' },
                { label: '🔋 Bağımsız Emisyon', value: result.independentEmissions, hint: 'Yerinde üretim' },
              ].map((d, i) => (
                <div key={i} className="bg-surface-2 border border-white/[0.08] rounded-lg p-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{d.label}</div>
                  <div className="text-lg font-bold font-mono text-slate-100 my-1">{d.value.toFixed(4)} tCO₂e</div>
                  <div className="text-[10px] text-slate-500">{d.hint}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Process Steps */}
      <div className="card">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">🗺️ CBAM Uyum Süreci</div>
        <div className="flex items-start overflow-x-auto pb-2 gap-0">
          {CBAM_STEPS.map((step, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center text-center min-w-[100px]">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mb-2
                  ${step.done ? 'text-white shadow-accent' : 'bg-surface-2 text-slate-500 border border-white/[0.08]'}`}
                  style={step.done ? { background: 'linear-gradient(135deg,#10b981,#059669)' } : {}}>
                  {step.done ? '✓' : step.n}
                </div>
                <div className="text-xs font-semibold text-slate-200">{step.label}</div>
              </div>
              {i < CBAM_STEPS.length - 1 && (
                <div className="text-slate-600 mx-1 mt-[-18px] text-sm">→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">🌍 CBAM Kapsamındaki Sektörler</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {CBAM_SECTORS.map((s, i) => (
              <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border
                ${s.active ? 'bg-blue-500/10 border-blue-500/25 text-blue-300' : 'bg-surface-2 border-white/[0.08] text-slate-400'}`}>
                <span>{s.icon}</span><span>{s.label}</span>
                {s.active && <span className="bg-primary text-white text-[9px] px-1.5 py-0.5 rounded-full">Aktif</span>}
              </div>
            ))}
          </div>
          <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-lg p-3">
            <div className="text-xs font-bold text-emerald-400 mb-2">🇪🇺 Green Deal ↔ CBAM</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AB'nin 2050 Karbon Nötr hedefi kapsamında CBAM, ithal ürünlerdeki gömülü emisyonu
              EU ETS fiyatı üzerinden sertifika alınarak dengeler.
              <strong className="text-primary"> Türkiye'nin %70 EAF </strong>
              üretimi gerçek veri bildirimiyle büyük maliyet avantajı sağlar.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">📌 Önemli Tarihler</div>
          <div className="flex flex-col gap-3">
            {[
              { date: '01.01.2026', event: 'Kesin Rejim Başlangıcı', color: '#10b981' },
              { date: '31.03.2026', event: 'ACD Başvuru Son Tarihi', color: '#f59e0b' },
              { date: '01.02.2027', event: 'CBAM Sertifika Satışı', color: '#3b82f6' },
              { date: '30.09.2027', event: 'İlk Yıllık Beyan (2026)', color: '#3b82f6' },
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: t.color }} />
                <div>
                  <div className="text-[10px] font-mono text-slate-500">{t.date}</div>
                  <div className="text-sm font-semibold text-slate-200">{t.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
