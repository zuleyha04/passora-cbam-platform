import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { simulateSupplierMix, formatEur, formatNum, formatTCO2, EMISSION_FACTORS } from '../engine/cbam';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import styles from './Simulation.module.css';

export default function Simulation() {
  const { state } = useApp();
  const { suppliers, production, etsPrice } = state;

  // Local slider state (before = current, after = modified)
  const [afterSuppliers, setAfterSuppliers] = useState(suppliers.map(s => ({ ...s })));

  const totalAfter = afterSuppliers.reduce((s, x) => s + x.share, 0);
  const isValid = Math.abs(totalAfter - 100) < 0.5;

  const beforeResult = simulateSupplierMix(suppliers, production, etsPrice);
  const afterResult  = isValid ? simulateSupplierMix(afterSuppliers, production, etsPrice) : null;

  const saving = afterResult ? beforeResult.cbamCost - afterResult.cbamCost : 0;
  const savingPct = afterResult ? (saving / beforeResult.cbamCost) * 100 : 0;

  const chartData = [
    { name: 'Mevcut', cost: beforeResult.cbamCost, emission: beforeResult.totalEmission, fill: '#ef4444' },
    ...(afterResult ? [{ name: 'Simülasyon', cost: afterResult.cbamCost, emission: afterResult.totalEmission, fill: '#10b981' }] : []),
  ];

  const updateShare = (i: number, val: number) => {
    const next = afterSuppliers.map((s, idx) => idx === i ? { ...s, share: val } : s);
    setAfterSuppliers(next);
  };

  const updateEf = (i: number, val: number) => {
    const next = afterSuppliers.map((s, idx) => idx === i ? { ...s, specificEf: val } : s);
    setAfterSuppliers(next);
  };

  return (
    <div className={styles.sim}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>⟳ Tedarikçi Simülasyonu</h1>
          <p className={styles.sub}>"Çolakoğlu yerine Erdemir'den alsaydım ne kadar kazanırdım?"</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.quarterly}>
            <span>Çeyreklik Üretim:</span>
            <strong>{formatNum(production, 0)} ton</strong>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className={styles.mainGrid}>
        {/* Left: Slider panel */}
        <div className="card">
          <div className={styles.panelTitle}>⚙️ Tedarikçi Karma Ayarı</div>
          <div className={styles.totalBadge}>
            <span>Toplam Pay:</span>
            <span className={`badge ${isValid ? 'badge-accent' : 'badge-danger'}`}>{totalAfter.toFixed(0)}%</span>
          </div>

          {afterSuppliers.map((s, i) => {
            const emission = (s.share / 100) * production * s.specificEf;
            return (
              <div key={i} className={styles.supplierCard}>
                <div className={styles.supplierHeader}>
                  <div className={styles.supplierName}>{s.name}</div>
                  <div className={styles.supplierMeta}>
                    <span className={`badge ${s.type === 'BOF' ? 'badge-danger' : s.type === 'EAF' ? 'badge-accent' : 'badge-warning'}`}>
                      {s.type}
                    </span>
                    <span className="badge badge-ghost">{s.country}</span>
                  </div>
                </div>

                <div className={styles.sliderRow}>
                  <label className={styles.sliderLabel}>Pay: <strong>{s.share.toFixed(0)}%</strong></label>
                  <input type="range" min={0} max={100} step={5} value={s.share}
                    onChange={e => updateShare(i, +e.target.value)}
                    style={{ '--pct': `${s.share}%` } as React.CSSProperties} />
                </div>

                <div className={styles.efRow}>
                  <label className={styles.sliderLabel}>EF (tCO₂e/ton):</label>
                  <input type="number" className="form-input font-mono" style={{ width: 100 }} value={s.specificEf} step="0.01"
                    onChange={e => updateEf(i, +e.target.value)} />
                </div>

                <div className={styles.supplierEmission}>
                  Emisyon: <span className="font-mono">{emission.toFixed(2)} tCO₂e</span>
                  {' · '} Maliyet: <span className="font-mono">{formatEur(emission * etsPrice)}</span>
                </div>
              </div>
            );
          })}

          {!isValid && (
            <div className="alert alert-danger" style={{ marginTop: 12 }}>
              ⚠️ Payların toplamı 100% olmalı (şu an: {totalAfter.toFixed(0)}%)
            </div>
          )}

          {/* Reference EF table */}
          <div className={styles.efTable}>
            <div className={styles.panelTitle} style={{ marginBottom: 8 }}>📊 AB CBAM Benchmark EF Referansı</div>
            {[
              { label: 'BF-BOF (Entegre)', ef: EMISSION_FACTORS.steelBOF, color: '#ef4444' },
              { label: 'DRI-EAF (Gaz)', ef: EMISSION_FACTORS.steelDRIEAF, color: '#f59e0b' },
              { label: 'Scrap-EAF', ef: EMISSION_FACTORS.steelEAF, color: '#10b981' },
              { label: 'Kardemir EPD', ef: EMISSION_FACTORS.epdA1A3, color: '#8b5cf6' },
            ].map((r, i) => (
              <div key={i} className={styles.efRow2}>
                <span style={{ color: r.color }}>■</span>
                <span style={{ flex: 1 }}>{r.label}</span>
                <span className="font-mono badge badge-ghost">{r.ef} tCO₂e/ton</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Results */}
        <div className={styles.rightCol}>
          {/* Saving cards */}
          <div className={styles.savingGrid}>
            <div className={`stat-card ${styles.savingCard}`}>
              <div className="stat-label">Mevcut CBAM Maliyet</div>
              <div className="stat-value" style={{ color: 'var(--color-danger)' }}>{formatEur(beforeResult.cbamCost)}</div>
              <div className="stat-unit">{formatTCO2(beforeResult.totalEmission)} · WEF: {beforeResult.weightedEf.toFixed(4)}</div>
            </div>
            {afterResult && (
              <>
                <div className={`stat-card ${styles.savingCard}`}>
                  <div className="stat-label">Simülasyon CBAM Maliyet</div>
                  <div className="stat-value" style={{ color: 'var(--color-accent)' }}>{formatEur(afterResult.cbamCost)}</div>
                  <div className="stat-unit">{formatTCO2(afterResult.totalEmission)} · WEF: {afterResult.weightedEf.toFixed(4)}</div>
                </div>
                <div className={`stat-card ${styles.savingBig}`} style={{ borderColor: saving > 0 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)' }}>
                  <div className="stat-label">{saving > 0 ? '💰 Çeyreklik Tasarruf' : '📉 Çeyreklik Artış'}</div>
                  <div className="stat-value" style={{ color: saving > 0 ? 'var(--color-accent)' : 'var(--color-danger)', fontSize: '2rem' }}>
                    {saving > 0 ? '+' : ''}{formatEur(saving)}
                  </div>
                  <div className="stat-unit">%{Math.abs(savingPct).toFixed(1)} {saving > 0 ? 'azalma' : 'artış'}</div>
                  {saving > 0 && (
                    <div className={styles.yearlyNote}>Yıllık tasarruf: <strong>{formatEur(saving * 4)}</strong></div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Bar chart comparison */}
          <div className="card">
            <div className={styles.panelTitle}>📊 Maliyet Karşılaştırması</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tickFormatter={v => `€${(v/1000).toFixed(0)}K`} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: unknown) => [formatEur(v as number), 'CBAM Maliyet']}
                />
                <Bar dataKey="cost" radius={[6, 6, 0, 0]}>
                  {chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Emission breakdown per supplier */}
          <div className="card">
            <div className={styles.panelTitle}>🏭 Tedarikçi Başına Ağırlıklı Emisyon</div>
            <div className={styles.wefGrid}>
              {[
                { label: 'Mevcut', suppliers, color: '#ef4444' },
                ...(isValid ? [{ label: 'Simülasyon', suppliers: afterSuppliers, color: '#10b981' }] : []),
              ].map((scenario, si) => (
                <div key={si}>
                  <div className={styles.wefLabel} style={{ color: scenario.color }}>● {scenario.label}</div>
                  {scenario.suppliers.map((s, i) => (
                    <div key={i} className={styles.wefRow}>
                      <span>{s.name}</span>
                      <span className="badge badge-ghost font-mono">{s.share}%</span>
                      <span className="font-mono" style={{ color: scenario.color }}>{((s.share / 100) * s.specificEf).toFixed(4)}</span>
                      <span className="text-xs" style={{ color: 'var(--color-text-3)' }}>tCO₂e/ton</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Scenario note */}
          <div className="alert alert-info">
            <span>💡</span>
            <div>
              <strong>Ortak Tedarikçi Veritabanı:</strong> Tedarikçinizin emisyon verisine ulaşamıyorsanız,
              platformumuzda kayıtlı diğer kullanıcıların aynı tedarikçi için girdiği anonimleştirilmiş verileri kullanabilirsiniz.
              Çin ve Uzak Doğu tedarikçileri için AB varsayılan değerleri otomatik uygulanır.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
