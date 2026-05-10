import { useState } from 'react';
import { useAppSelector } from '../store';
import { simulateSupplierMix, formatEur, EMISSION_FACTORS } from '../engine/cbam';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Simulation() {
  const { suppliers, production, etsPrice } = useAppSelector(s => s.cbam);

  const [afterSuppliers, setAfterSuppliers] = useState(suppliers.map(s => ({ ...s })));

  const totalAfter = afterSuppliers.reduce((s, x) => s + x.share, 0);
  const isValid    = Math.abs(totalAfter - 100) < 0.5;

  const beforeResult = simulateSupplierMix(suppliers, production, etsPrice);
  const afterResult  = isValid ? simulateSupplierMix(afterSuppliers, production, etsPrice) : null;
  const saving       = afterResult ? beforeResult.cbamCost - afterResult.cbamCost : 0;
  const savingPct    = afterResult ? (saving / beforeResult.cbamCost) * 100 : 0;

  const chartData = [
    { name: 'Mevcut',     cost: beforeResult.cbamCost, fill: '#ef4444' },
    ...(afterResult ? [{ name: 'Simülasyon', cost: afterResult.cbamCost, fill: '#10b981' }] : []),
  ];

  const updateShare = (i: number, val: number) =>
    setAfterSuppliers(prev => prev.map((s, idx) => idx === i ? { ...s, share: val } : s));

  const updateEf = (i: number, val: number) =>
    setAfterSuppliers(prev => prev.map((s, idx) => idx === i ? { ...s, specificEf: val } : s));

  return (
    <div className="flex flex-col gap-5 p-6 max-w-6xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100">⟳ Tedarikçi Simülasyonu</h1>
        <p className="text-sm text-slate-500 mt-1 italic">"Çolakoğlu yerine Erdemir'den alsaydım ne kadar kazanırdım?"</p>
      </div>

      <div className="grid grid-cols-[360px_1fr] gap-5 items-start">
        {/* Left: Sliders */}
        <div className="flex flex-col gap-4">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">⚙️ Tedarikçi Karma Ayarı</div>
              <span className={`badge ${isValid ? 'badge-accent' : 'badge-danger'}`}>Toplam: {totalAfter.toFixed(0)}%</span>
            </div>

            {afterSuppliers.map((s, i) => {
              const emission = (s.share / 100) * production * s.specificEf;
              return (
                <div key={i} className="bg-surface-2 border border-white/[0.08] rounded-xl p-4 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-slate-100">{s.name}</div>
                    <div className="flex gap-1.5">
                      <span className={`badge ${s.type === 'BOF' ? 'badge-danger' : s.type === 'EAF' ? 'badge-accent' : 'badge-warning'}`}>
                        {s.type}
                      </span>
                      <span className="badge badge-ghost">{s.country}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 mb-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Pay</span><strong className="text-slate-200">{s.share.toFixed(0)}%</strong>
                    </div>
                    <input type="range" min={0} max={100} step={5} value={s.share}
                      onChange={e => updateShare(i, +e.target.value)} />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                    <span>EF (tCO₂e/ton):</span>
                    <input type="number" className="form-input font-mono text-xs w-20" value={s.specificEf} step="0.01"
                      onChange={e => updateEf(i, +e.target.value)} />
                  </div>

                  <div className="text-xs text-slate-500">
                    Emisyon: <span className="font-mono text-slate-300">{emission.toFixed(2)} tCO₂e</span>
                    {' · '}
                    <span className="font-mono text-slate-300">{formatEur(emission * etsPrice)}</span>
                  </div>
                </div>
              );
            })}

            {!isValid && (
              <div className="alert alert-danger">⚠️ Paylar toplamı 100% olmalı (şu an: {totalAfter.toFixed(0)}%)</div>
            )}
          </div>

          {/* EF Reference */}
          <div className="card">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">📊 AB CBAM Benchmark EF</div>
            {[
              { label: 'BF-BOF (Entegre)', ef: EMISSION_FACTORS.steelBOF,    color: '#ef4444' },
              { label: 'DRI-EAF (Gaz)',    ef: EMISSION_FACTORS.steelDRIEAF, color: '#f59e0b' },
              { label: 'Scrap-EAF',        ef: EMISSION_FACTORS.steelEAF,    color: '#10b981' },
              { label: 'Kardemir EPD',     ef: EMISSION_FACTORS.epdA1A3,     color: '#8b5cf6' },
            ].map((r, i) => (
              <div key={i} className="flex items-center gap-2 py-2 border-b border-white/[0.06] last:border-0 text-xs text-slate-400">
                <span style={{ color: r.color }}>■</span>
                <span className="flex-1">{r.label}</span>
                <span className="badge badge-ghost font-mono">{r.ef} tCO₂e/ton</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Results */}
        <div className="flex flex-col gap-4">
          {/* Saving Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="stat-card">
              <div className="stat-label">Mevcut CBAM Maliyet</div>
              <div className="stat-value text-red-400 text-xl">{formatEur(beforeResult.cbamCost)}</div>
              <div className="stat-unit">{beforeResult.totalEmission.toFixed(2)} tCO₂e · WEF: {beforeResult.weightedEf.toFixed(4)}</div>
            </div>
            {afterResult && (
              <div className="stat-card">
                <div className="stat-label">Simülasyon CBAM Maliyet</div>
                <div className="stat-value text-emerald-400 text-xl">{formatEur(afterResult.cbamCost)}</div>
                <div className="stat-unit">{afterResult.totalEmission.toFixed(2)} tCO₂e · WEF: {afterResult.weightedEf.toFixed(4)}</div>
              </div>
            )}
            {afterResult && (
              <div className="stat-card col-span-2 border-emerald-500/20">
                <div className="stat-label">{saving > 0 ? '💰 Çeyreklik Tasarruf' : '📉 Çeyreklik Artış'}</div>
                <div className={`text-3xl font-extrabold font-mono ${saving > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {saving > 0 ? '+' : ''}{formatEur(saving)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  %{Math.abs(savingPct).toFixed(1)} {saving > 0 ? 'azalma' : 'artış'}
                  {saving > 0 && <> · Yıllık: <strong className="text-emerald-400">{formatEur(saving * 4)}</strong></>}
                </div>
              </div>
            )}
          </div>

          {/* Chart */}
          <div className="card">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">📊 Maliyet Karşılaştırması</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tickFormatter={v => `€${((v as number)/1000).toFixed(0)}K`} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: unknown) => [formatEur(v as number), 'CBAM Maliyet']}
                />
                <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                  {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weighted EF breakdown */}
          <div className="card">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">🏭 Ağırlıklı Emisyon Detayı</div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Mevcut', list: suppliers, color: '#ef4444' },
                ...(isValid ? [{ label: 'Simülasyon', list: afterSuppliers, color: '#10b981' }] : []),
              ].map((scenario, si) => (
                <div key={si}>
                  <div className="text-xs font-bold mb-2" style={{ color: scenario.color }}>● {scenario.label}</div>
                  {scenario.list.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5 border-b border-white/[0.06] last:border-0 text-xs text-slate-400">
                      <span className="flex-1">{s.name}</span>
                      <span className="badge badge-ghost">{s.share}%</span>
                      <span className="font-mono" style={{ color: scenario.color }}>{((s.share / 100) * s.specificEf).toFixed(4)}</span>
                      <span className="text-slate-600">tCO₂e/ton</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="alert alert-info">
            <span>💡</span>
            <div>
              <strong>Ortak Tedarikçi DB:</strong> Tedarikçi verisine ulaşamıyorsanız,
              platformdaki anonimleştirilmiş verilerden yararlanabilirsiniz.
              Çin kaynaklı çelik için AB varsayılan değerleri otomatik uygulanır.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
