import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatNum, formatEur, formatTCO2 } from '../engine/cbam';
import styles from './Calculator.module.css';

type Tab = 'fuel' | 'electricity' | 'precursor' | 'transport' | 'results';

export default function Calculator() {
  const { state, dispatch } = useApp();
  const [tab, setTab] = useState<Tab>('fuel');
  const { fuels, electricity, precursors, transport, production, period, result } = state;

  const handleCalculate = () => {
    dispatch({ type: 'CALCULATE' });
    setTab('results');
  };

  return (
    <div className={styles.calc}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>⚗ Emisyon Hesaplayıcı</h1>
          <p className={styles.sub}>CBAM Reg. (EU) 2023/956 · passora_cbam_steel_calculator metodolojisi</p>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.prodInput}>
            <label className="form-label">Üretim (ton)</label>
            <input type="number" className="form-input" value={production}
              onChange={e => dispatch({ type: 'SET_PRODUCTION', payload: +e.target.value })} />
          </div>
          <div className={styles.prodInput}>
            <label className="form-label">Dönem</label>
            <select className="form-input form-select" value={period}
              onChange={e => dispatch({ type: 'SET_PERIOD', payload: e.target.value })}>
              {['2026-Q1','2026-Q2','2026-Q3','2026-Q4'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleCalculate}>⚡ Hesapla</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {(['fuel','electricity','precursor','transport','results'] as Tab[]).map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {{ fuel:'🔥 Yakıt', electricity:'⚡ Elektrik', precursor:'🏗 Precursor', transport:'🚛 Taşıma', results:'📊 Sonuçlar' }[t]}
          </button>
        ))}
      </div>

      {/* ── Tab: Fuel ── */}
      {tab === 'fuel' && (
        <div className={`card ${styles.tabContent}`}>
          <div className={styles.sectionTitle}>1) Doğrudan Emisyon — Yakıt / Proses Verileri</div>
          <div className={styles.sectionHint}>Formül: Miktar × NCV × EF × Oksidasyon × (1 − Biomas)</div>
          <div className="alert alert-info" style={{ marginBottom: 12 }}>
            <span>ℹ️</span> NCV ve EF değerleri IPCC 2006 ve AB MRR metodolojisine dayanmaktadır.
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Yakıt / Kaynak</th><th>Miktar</th><th>Birim</th>
                  <th>NCV (TJ/birim)</th><th>EF (tCO₂e/TJ)</th><th>Oksidasyon</th><th>Biomas</th><th>Emisyon (tCO₂e)</th><th></th>
                </tr>
              </thead>
              <tbody>
                {fuels.map((f, i) => {
                  const em = f.amount * f.ncv * f.ef * f.oxidation * (1 - f.biomassShare);
                  return (
                    <tr key={i}>
                      <td><input className="form-input" style={{ minWidth: 130 }} value={f.name}
                        onChange={e => dispatch({ type: 'UPDATE_FUEL', index: i, payload: { name: e.target.value } })} /></td>
                      <td><input type="number" className="form-input font-mono" style={{ width: 100 }} value={f.amount}
                        onChange={e => dispatch({ type: 'UPDATE_FUEL', index: i, payload: { amount: +e.target.value } })} /></td>
                      <td><select className="form-input form-select" style={{ width: 80 }} value={f.unit}
                        onChange={e => dispatch({ type: 'UPDATE_FUEL', index: i, payload: { unit: e.target.value } })}>
                        <option>Nm³</option><option>ton</option><option>GJ</option>
                      </select></td>
                      <td><input type="number" className="form-input font-mono" style={{ width: 100 }} value={f.ncv} step="0.0000001"
                        onChange={e => dispatch({ type: 'UPDATE_FUEL', index: i, payload: { ncv: +e.target.value } })} /></td>
                      <td><input type="number" className="form-input font-mono" style={{ width: 80 }} value={f.ef}
                        onChange={e => dispatch({ type: 'UPDATE_FUEL', index: i, payload: { ef: +e.target.value } })} /></td>
                      <td><input type="number" className="form-input font-mono" style={{ width: 70 }} value={f.oxidation} step="0.01" min="0" max="1"
                        onChange={e => dispatch({ type: 'UPDATE_FUEL', index: i, payload: { oxidation: +e.target.value } })} /></td>
                      <td><input type="number" className="form-input font-mono" style={{ width: 70 }} value={f.biomassShare} step="0.01" min="0" max="1"
                        onChange={e => dispatch({ type: 'UPDATE_FUEL', index: i, payload: { biomassShare: +e.target.value } })} /></td>
                      <td><span className="badge badge-primary font-mono">{em.toFixed(3)}</span></td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: 'REMOVE_FUEL', index: i })}>✕</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => dispatch({ type: 'ADD_FUEL' })}>
            + Yakıt Ekle
          </button>
        </div>
      )}

      {/* ── Tab: Electricity ── */}
      {tab === 'electricity' && (
        <div className={`card ${styles.tabContent}`}>
          <div className={styles.sectionTitle}>2) Dolaylı Emisyon — Elektrik</div>
          <div className={styles.sectionHint}>Türkiye Grid EF: 0.4437 tCO₂e/MWh (TEIAS 2024) · Kardemir EPD EF: Yerinde 1.8 / Grid 0.91 kgCO₂e/kWh</div>
          <div className={styles.elecGrid}>
            <div className={`card ${styles.elecCard}`}>
              <div className={styles.elecCardTitle}>🔌 Toplam Elektrik (Ortalama EF)</div>
              <div className="form-group">
                <label className="form-label">Toplam Elektrik (kWh)</label>
                <input type="number" className="form-input font-mono" value={electricity.totalKwh}
                  onChange={e => dispatch({ type: 'SET_ELECTRICITY', payload: { totalKwh: +e.target.value } })} />
                <div className="form-hint">0 bırakırsanız yerinde/grid ayrımı kullanılır</div>
              </div>
              <div className="form-group">
                <label className="form-label">Ort. EF (kgCO₂e/kWh)</label>
                <input type="number" className="form-input font-mono" value={electricity.avgEf} step="0.01"
                  onChange={e => dispatch({ type: 'SET_ELECTRICITY', payload: { avgEf: +e.target.value } })} />
              </div>
            </div>
            <div className={`card ${styles.elecCard}`}>
              <div className={styles.elecCardTitle}>🏭 Yerinde / Grid Ayrımı</div>
              {[
                { label: 'Yerinde Üretim (kWh)', key: 'onsiteKwh' as const, ef: 'onsiteEf' as const, efLabel: 'Yerinde EF' },
                { label: 'Grid Elektrik (kWh)',  key: 'gridKwh'  as const, ef: 'gridEf'  as const, efLabel: 'Grid EF' },
              ].map(row => (
                <div key={row.key} className={styles.elecRow}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">{row.label}</label>
                    <input type="number" className="form-input font-mono" value={electricity[row.key]}
                      onChange={e => dispatch({ type: 'SET_ELECTRICITY', payload: { [row.key]: +e.target.value } })} />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">{row.efLabel}</label>
                    <input type="number" className="form-input font-mono" value={electricity[row.ef]} step="0.01"
                      onChange={e => dispatch({ type: 'SET_ELECTRICITY', payload: { [row.ef]: +e.target.value } })} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.elecSummary}>
            Hesaplanan Elektrik Emisyonu:{' '}
            <strong className="font-mono" style={{ color: 'var(--color-primary)' }}>
              {electricity.totalKwh > 0
                ? (electricity.totalKwh * electricity.avgEf / 1000).toFixed(3)
                : ((electricity.onsiteKwh * electricity.onsiteEf + electricity.gridKwh * electricity.gridEf) / 1000).toFixed(3)
              } tCO₂e
            </strong>
          </div>
        </div>
      )}

      {/* ── Tab: Precursor ── */}
      {tab === 'precursor' && (
        <div className={`card ${styles.tabContent}`}>
          <div className={styles.sectionTitle}>3) Precursor / Hammadde Gömülü Emisyonları</div>
          <div className={styles.sectionHint}>Formül: Miktar (ton) × EF (tCO₂e/ton)</div>
          <div className="alert alert-info" style={{ marginBottom: 12 }}>
            <span>ℹ️</span> Çelik billet için tipik EF: 2.1 tCO₂e/ton. Tedarikçiden EPD belgesi alınması önerilir.
          </div>
          <table className="table">
            <thead>
              <tr><th>Precursor</th><th>Miktar (ton)</th><th>EF (tCO₂e/ton)</th><th>Emisyon (tCO₂e)</th><th>Not</th><th></th></tr>
            </thead>
            <tbody>
              {precursors.map((p, i) => (
                <tr key={i}>
                  <td><input className="form-input" value={p.name}
                    onChange={e => dispatch({ type: 'UPDATE_PRECURSOR', index: i, payload: { name: e.target.value } })} /></td>
                  <td><input type="number" className="form-input font-mono" style={{ width: 100 }} value={p.amountTon}
                    onChange={e => dispatch({ type: 'UPDATE_PRECURSOR', index: i, payload: { amountTon: +e.target.value } })} /></td>
                  <td><input type="number" className="form-input font-mono" style={{ width: 100 }} value={p.ef} step="0.01"
                    onChange={e => dispatch({ type: 'UPDATE_PRECURSOR', index: i, payload: { ef: +e.target.value } })} /></td>
                  <td><span className="badge badge-warning font-mono">{(p.amountTon * p.ef).toFixed(3)}</span></td>
                  <td><input className="form-input" placeholder="Açıklama..." value={p.note ?? ''}
                    onChange={e => dispatch({ type: 'UPDATE_PRECURSOR', index: i, payload: { note: e.target.value } })} /></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => dispatch({ type: 'REMOVE_PRECURSOR', index: i })}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-ghost btn-sm" style={{ marginTop: 8 }} onClick={() => dispatch({ type: 'ADD_PRECURSOR' })}>
            + Precursor Ekle
          </button>
        </div>
      )}

      {/* ── Tab: Transport ── */}
      {tab === 'transport' && (
        <div className={`card ${styles.tabContent}`}>
          <div className={styles.sectionTitle}>4) Taşıma Emisyonları — DEFRA EF</div>
          <div className={styles.sectionHint}>Formül: Kütle (ton) × Mesafe (km) × EF (kgCO₂e/t-km) / 1000 = tCO₂e</div>
          <div className={styles.defraRef}>
            <strong>DEFRA Emisyon Faktörleri:</strong>
            Karayolu: 0.062 · Demiryolu: 0.022 · Deniz: 0.011 · Hava: 1.020 kgCO₂e/t-km
          </div>
          <table className="table">
            <thead>
              <tr><th>Taşıma Modu</th><th>Kütle (ton)</th><th>Mesafe (km)</th><th>EF (kgCO₂e/t-km)</th><th>Emisyon (tCO₂e)</th></tr>
            </thead>
            <tbody>
              {transport.map((t, i) => {
                const em = t.massTon * t.distanceKm * t.efKgPerTkm / 1000;
                return (
                  <tr key={i}>
                    <td><select className="form-input form-select" value={t.mode}
                      onChange={e => dispatch({ type: 'UPDATE_TRANSPORT', index: i, payload: { mode: e.target.value } })}>
                      <option>Karayolu</option><option>Demiryolu</option><option>Deniz</option><option>Hava</option>
                    </select></td>
                    <td><input type="number" className="form-input font-mono" style={{ width: 100 }} value={t.massTon}
                      onChange={e => dispatch({ type: 'UPDATE_TRANSPORT', index: i, payload: { massTon: +e.target.value } })} /></td>
                    <td><input type="number" className="form-input font-mono" style={{ width: 100 }} value={t.distanceKm}
                      onChange={e => dispatch({ type: 'UPDATE_TRANSPORT', index: i, payload: { distanceKm: +e.target.value } })} /></td>
                    <td>
                      <input type="number" className="form-input font-mono" style={{ width: 90 }} value={t.efKgPerTkm} step="0.001"
                        onChange={e => dispatch({ type: 'UPDATE_TRANSPORT', index: i, payload: { efKgPerTkm: +e.target.value } })} />
                    </td>
                    <td><span className={`badge ${em > 0 ? 'badge-warning' : 'badge-ghost'} font-mono`}>{em.toFixed(3)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab: Results ── */}
      {tab === 'results' && (
        <div className={styles.resultsSection}>
          {!result ? (
            <div className={`card ${styles.noResult}`}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>⚗</div>
              <div>Henüz hesaplama yapılmadı.</div>
              <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={handleCalculate}>Hesapla</button>
            </div>
          ) : (
            <>
              {/* Method badge */}
              <div className={`alert ${result.isDefaultUsed ? 'alert-warning' : 'alert-success'}`}>
                <span>{result.isDefaultUsed ? '⚠️' : '✅'}</span>
                <span>
                  Hesaplama Yöntemi: <strong>{result.calculationMethod === 'actual_data' ? 'Gerçek Veri (Hesaplama Tabanlı)' : 'EPD/Default Değer'}</strong>
                  {result.isDefaultUsed && ' — Gerçek enerji verisi girildiğinde maliyet düşebilir.'}
                </span>
              </div>

              {/* Result grid */}
              <div className={styles.resultGrid}>
                {[
                  { label: 'Doğrudan Emisyon (Yakıt)', value: formatTCO2(result.directFuel), color: '#3b82f6' },
                  { label: 'Dolaylı Emisyon (Elektrik)', value: formatTCO2(result.electricity), color: '#10b981' },
                  { label: 'Precursor Emisyonu', value: formatTCO2(result.precursorTotal), color: '#f59e0b' },
                  { label: 'Taşıma Emisyonu', value: formatTCO2(result.transportTotal), color: '#8b5cf6' },
                  { label: 'TOPLAM Gömülü Emisyon', value: formatTCO2(result.totalEmbedded), color: 'var(--color-text)', big: true },
                  { label: 'Spesifik Emisyon', value: `${result.specificEmbedded.toFixed(6)} tCO₂e/ton`, color: 'var(--color-primary)', big: true },
                  { label: 'EPD Benchmark', value: `${result.epdBenchmarkSpecific} tCO₂e/ton`, color: '#8b5cf6' },
                  { label: 'EPD Farkı', value: `${result.diffVsEpd > 0 ? '+' : ''}${result.diffVsEpd.toFixed(6)}`, color: result.status === 'above' ? 'var(--color-danger)' : 'var(--color-accent)' },
                  { label: 'CBAM Sertifika', value: `${formatNum(result.certificatesRequired, 2)} adet`, color: 'var(--color-warning)' },
                  { label: 'CBAM Maliyet (€)', value: formatEur(result.cbamCostEur), color: 'var(--color-danger)', big: true },
                  { label: 'Bağımlı Emisyon (Grid)', value: formatTCO2(result.dependentEmissions), color: '#64748b' },
                  { label: 'Bağımsız Emisyon', value: formatTCO2(result.independentEmissions), color: '#64748b' },
                ].map((r, i) => (
                  <div key={i} className={`stat-card ${r.big ? styles.resultBig : ''}`}>
                    <div className="stat-label">{r.label}</div>
                    <div className="stat-value" style={{ color: r.color, fontSize: r.big ? '1.4rem' : '1.1rem' }}>{r.value}</div>
                  </div>
                ))}
              </div>

              {/* Calculation notes */}
              <div className={`card ${styles.notesCard}`}>
                <div className={styles.sectionTitle}>📋 Hesaplama Detayı</div>
                <pre className={styles.notes}>{result.directFuel > 0
                  ? `Doğrudan (Yakıt): ${formatTCO2(result.directFuel)}
Dolaylı (Elektrik): ${formatTCO2(result.electricity)}
Precursor: ${formatTCO2(result.precursorTotal)}
Taşıma: ${formatTCO2(result.transportTotal)}
─────────────────────────
Toplam: ${formatTCO2(result.totalEmbedded)}
Üretim: ${formatNum(state.production, 0)} ton
Spesifik: ${result.specificEmbedded.toFixed(6)} tCO₂e/ton
─────────────────────────
EPD Benchmark: 2.29 tCO₂e/ton
Fark: ${result.diffVsEpd.toFixed(6)} tCO₂e/ton
─────────────────────────
CBAM Sertifika: ${formatNum(result.certificatesRequired, 2)} adet
ETS Fiyatı: €${state.etsPrice}/tCO₂e
CBAM Maliyet: ${formatEur(result.cbamCostEur)}`
                  : 'Veri girilmedi — EPD/Default değer kullanıldı.'}</pre>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
