import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import { setResult } from '../store/cbamSlice';
import { calculateSteelEmissions, generateRecommendations, formatEur } from '../engine/cbam';

const SEV_COLOR = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-accent' } as const;
const CAT_ICON  = { electricity: '⚡', fuel: '🔥', transport: '🚛', supplier: '🏭', epd: '📄', general: '💡' } as const;
const SEV_BAR   = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' } as const;

export default function Recommendations() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const { recommendations, result, production, fuels, electricity, precursors, transport, suppliers, etsPrice } = useAppSelector(s => s.cbam);

  const handleRefresh = () => {
    try {
      const res = calculateSteelEmissions(production, fuels, electricity, precursors, transport, etsPrice);
      const recs = generateRecommendations(res, production, suppliers);
      dispatch(setResult({ result: res, recommendations: recs }));
    } catch {}
  };

  if (!result) {
    return (
      <div className="p-6 max-w-4xl animate-fade-in">
        <div className="card text-center py-20 text-slate-400">
          <div className="text-5xl mb-4">✦</div>
          <div className="text-base mb-5">AI önerileri görmek için önce hesaplama yapın.</div>
          <button className="btn btn-primary" onClick={() => navigate('/calculator')}>⚗ Hesaplamaya Git</button>
        </div>
      </div>
    );
  }

  const totalSavingEur  = recommendations.reduce((s, r) => s + (r.potentialSavingEur ?? 0), 0);
  const totalSavingTco2 = recommendations.reduce((s, r) => s + (r.potentialSavingTco2e ?? 0), 0);
  const highCount       = recommendations.filter(r => r.severity === 'high').length;

  return (
    <div className="flex flex-col gap-5 p-6 max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">✦ AI Destekli Öneri Paneli</h1>
          <p className="text-xs text-slate-500 mt-1">Kural tabanlı + DEFRA/EPD literatür kaynaklı öneriler</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleRefresh}>↺ Yenile</button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <div className="stat-card">
          <div className="stat-label">Toplam Öneri</div>
          <div className="stat-value">{recommendations.length}</div>
          <div className="stat-unit">{highCount} yüksek öncelikli</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Potansiyel Tasarruf</div>
          <div className="stat-value text-emerald-400 text-2xl">{formatEur(totalSavingEur)}</div>
          <div className="stat-unit">çeyreklik tahmini</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">CO₂ Azaltım Pot.</div>
          <div className="stat-value text-primary">{totalSavingTco2.toFixed(1)}</div>
          <div className="stat-unit">tCO₂e çeyreklik</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">EPD Durumu</div>
          <div className={`stat-value text-lg ${result.status === 'above' ? 'text-red-400' : 'text-emerald-400'}`}>
            {result.status === 'above' ? '▲ Üstünde' : '▼ Altında'}
          </div>
          <div className="stat-unit">{result.specificEmbedded.toFixed(4)} tCO₂e/ton</div>
        </div>
      </div>

      {/* Recommendation Cards */}
      <div className="flex flex-col gap-3">
        {recommendations.map((rec, i) => (
          <div key={rec.id}
            className="bg-surface border border-white/[0.08] rounded-xl overflow-hidden flex hover:border-white/[0.15] hover:translate-x-1 transition-all animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}>
            {/* Severity bar */}
            <div className="w-1 flex-shrink-0" style={{ background: SEV_BAR[rec.severity] }} />
            {/* Icon */}
            <div className="flex items-start px-4 py-4">
              <span className="text-2xl">{CAT_ICON[rec.category]}</span>
            </div>
            {/* Content */}
            <div className="flex-1 py-4 pr-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-bold text-slate-100 text-sm">{rec.title}</h3>
                <div className="flex gap-1.5 flex-shrink-0">
                  <span className={`badge ${SEV_COLOR[rec.severity]}`}>
                    {rec.severity === 'high' ? 'Yüksek' : rec.severity === 'medium' ? 'Orta' : 'Düşük'}
                  </span>
                  <span className="badge badge-ghost">{rec.source}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">{rec.description}</p>
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap gap-4">
                  {rec.potentialSavingTco2e !== undefined && (
                    <span className="text-xs font-mono font-semibold text-primary">
                      🌱 {rec.potentialSavingTco2e.toFixed(2)} tCO₂e azaltım
                    </span>
                  )}
                  {rec.potentialSavingEur !== undefined && (
                    <span className="text-xs font-mono font-semibold text-emerald-400">
                      💰 {formatEur(rec.potentialSavingEur)} tasarruf
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  <strong className="text-slate-400">→ Eylem:</strong> {rec.action}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Operational Tips */}
      <div className="card">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">🌱 Operasyonel Öneriler</div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: '☀️', title: 'Güneş Enerjisi',    desc: 'Çatı güneş paneli ile grid elektriği azaltın. Her 1 MWh kendi üretim = €45 tasarruf.' },
            { icon: '♻️', title: 'Hurda Oranı',        desc: 'EAF hurda girdisini artır. Her %10 artış ≈ %5 emisyon azalması.' },
            { icon: '🚂', title: 'Demiryolu Lojistik', desc: 'DEFRA\'ya göre demiryolu, karayolundan %65 düşük emisyon. Uzun mesafede tercih et.' },
            { icon: '📄', title: 'EPD Belgesi',        desc: 'Tedarikçiden EPD al. Default değer cezasından kurtulun.' },
            { icon: '🔋', title: 'Enerji Verimliliği', desc: 'ISO 50001 ile enerji yönetim sistemi kurun.' },
            { icon: '🤝', title: 'Tedarikçi Eğitimi', desc: 'Tedarikçilere CBAM veri girişi eğitimi verin. Doğru veri = düşük maliyet.' },
          ].map((t, i) => (
            <div key={i} className="bg-surface-2 border border-white/[0.08] rounded-xl p-4 hover:border-white/[0.15] transition-colors">
              <div className="text-2xl mb-2">{t.icon}</div>
              <div className="text-sm font-bold text-slate-100 mb-1">{t.title}</div>
              <div className="text-xs text-slate-400 leading-relaxed">{t.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Data Sources */}
      <div className="card">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">📚 Veri Kaynakları</div>
        <div className="flex flex-col gap-2">
          {[
            { name: 'DEFRA 2025', desc: 'UK Çevre Bakanlığı — Taşıma ve tarım emisyon faktörleri' },
            { name: 'AB CBAM', desc: 'Reg. (EU) 2023/956 · Uygulama Kılavuzu' },
            { name: 'EPD Turkey', desc: 'Kardemir Steel Profiles A1-A3: 2.29 tCO₂e/ton (doğrulanmış)' },
            { name: 'IPCC 2006', desc: 'Ulusal Sera Gazı Envanterleri — Yakıt EF' },
            { name: 'TEIAS 2024', desc: 'Türkiye Grid Emisyon Faktörü: 0.4437 tCO₂e/MWh' },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="badge badge-primary flex-shrink-0">{s.name}</span>
              <span className="text-xs text-slate-400 leading-relaxed">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
