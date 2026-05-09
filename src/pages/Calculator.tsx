import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store';
import {
  updateFuel, addFuel, removeFuel,
  setElectricity, updatePrecursor, addPrecursor, removePrecursor,
  updateTransport, setProduction, setPeriod, setResult,
} from '../store/cbamSlice';
import { calculateSteelEmissions, generateRecommendations, formatNum, formatEur, formatTCO2 } from '../engine/cbam';
import { useServerCalculateMutation } from '../store/api';

type Tab = 'fuel' | 'electricity' | 'precursor' | 'transport' | 'results';

export default function Calculator() {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const [tab, setTab] = useState<Tab>('fuel');
  const [saving, setSaving] = useState(false);
  const [useServer, setUseServer] = useState(false);

  const { fuels, electricity, precursors, transport, production, period, result, etsPrice, company, suppliers } = useAppSelector(s => s.cbam);
  const [serverCalc, { isLoading: isServerCalcLoading }] = useServerCalculateMutation();

  // ── Hesaplama: server veya local ────────────────────────────
  const handleCalculate = async () => {
    if (useServer) {
      // Server-side: /api/calculate
      try {
        const resp = await serverCalc({
          production, fuels, electricity, precursors, transport,
          etsPrice, company, period, saveToDb: false,
        }).unwrap();
        const serverResult = resp.data as Record<string, number | string | boolean | null>;
        // Map server response to local SteelEmissionResult shape
        const mapped = {
          directFuel:           serverResult.directFuel           as number,
          electricity:          serverResult.electricity          as number,
          precursorTotal:       serverResult.precursorTotal       as number,
          transportTotal:       serverResult.transportTotal       as number,
          totalEmbedded:        serverResult.totalEmbedded        as number,
          specificEmbedded:     serverResult.specificEmbedded     as number,
          certificatesRequired: serverResult.certificatesRequired as number,
          cbamCostEur:          serverResult.cbamCostEur          as number,
          epdBenchmarkSpecific: serverResult.epdBenchmarkSpecific as number,
          diffVsEpd:            serverResult.diffVsEpd            as number,
          status:               serverResult.status               as 'above' | 'below' | 'equal',
          isDefaultUsed:        serverResult.isDefaultUsed        as boolean,
          calculationMethod:    serverResult.calculationMethod    as string,
          dependentEmissions:   serverResult.dependentEmissions   as number,
          independentEmissions: serverResult.independentEmissions as number,
        };
        const recs = generateRecommendations(mapped as Parameters<typeof generateRecommendations>[0], production, suppliers);
        dispatch(setResult({ result: mapped as Parameters<typeof setResult>[0]['result'], recommendations: recs }));
        setTab('results');
      } catch (e) { alert('Sunucu hatası: ' + (e as Error).message); }
    } else {
      // Local (offline) hesaplama
      try {
        const res = calculateSteelEmissions(production, fuels, electricity, precursors, transport, etsPrice);
        const recs = generateRecommendations(res, production, suppliers);
        dispatch(setResult({ result: res, recommendations: recs }));
        setTab('results');
      } catch (e) { alert('Hesaplama hatası: ' + (e as Error).message); }
    }
  };

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      // /api/calculate ile saveToDb=true gönder (tek istekte hesapla+kaydet)
      await serverCalc({
        production, fuels, electricity, precursors, transport,
        etsPrice, company, period, saveToDb: true,
      }).unwrap();
      alert('✅ Hesaplama sunucuya kaydedildi!');
    } catch {
      alert('Kayıt hatası — Backend/Supabase bağlantısı kontrol edin');
    } finally { setSaving(false); }
  };

  const TABS: { id: Tab; label: string }[] = [
    { id: 'fuel', label: '🔥 Yakıt' },
    { id: 'electricity', label: '⚡ Elektrik' },
    { id: 'precursor', label: '🏗 Precursor' },
    { id: 'transport', label: '🚛 Taşıma' },
    { id: 'results', label: '📊 Sonuçlar' },
  ];

  return (
    <div className="flex flex-col gap-5 p-6 max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">⚗ Emisyon Hesaplayıcı</h1>
          <p className="text-xs text-slate-500 mt-1">CBAM Reg. (EU) 2023/956 · passora_cbam_steel_calculator metodolojisi</p>
        </div>
        <div className="flex items-end gap-2 flex-wrap">
          <div className="flex flex-col gap-1">
            <label className="form-label">Üretim (ton)</label>
            <input type="number" className="form-input w-28 font-mono" value={production}
              onChange={e => dispatch(setProduction(+e.target.value))} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="form-label">Dönem</label>
            <select className="form-select w-28" value={period}
              onChange={e => dispatch(setPeriod(e.target.value))}>
              {['2026-Q1','2026-Q2','2026-Q3','2026-Q4'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={handleCalculate} disabled={isServerCalcLoading}>
            {isServerCalcLoading ? '⏳ Sunucu...' : '⚡ Hesapla'}
          </button>
          <button
            className={`btn btn-sm ${useServer ? 'btn-accent' : 'btn-ghost'}`}
            onClick={() => setUseServer(v => !v)}
            title={useServer ? '/api/calculate (sunucu)' : 'Yerel hesaplama (offline)'}
          >
            {useServer ? '🌐 Sunucu' : '💻 Yerel'}
          </button>
          {result && (
            <button className="btn btn-ghost" onClick={handleSave} disabled={saving}>
              {saving ? '...' : '☁️ Kaydet'}
            </button>
          )}
        </div>
      </div>

      {/* Tab List */}
      <div className="tab-list">
        {TABS.map(t => (
          <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Fuel ── */}
      {tab === 'fuel' && (
        <div className="card">
          <div className="font-semibold text-slate-200 mb-1">1) Doğrudan Emisyon — Yakıt / Proses</div>
          <div className="text-xs font-mono text-slate-500 mb-3">Formül: Miktar × NCV × EF × Oksidasyon × (1 − Biomass)</div>
          <div className="alert alert-info mb-4"><span>ℹ️</span> NCV ve EF değerleri IPCC 2006 ve AB MRR metodolojisine dayanır.</div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr>
                <th>Yakıt</th><th>Miktar</th><th>Birim</th><th>NCV (TJ/birim)</th>
                <th>EF (tCO₂e/TJ)</th><th>Oksidasyon</th><th>Biomass</th><th>Emisyon</th><th/>
              </tr></thead>
              <tbody>
                {fuels.map((f, i) => {
                  const em = f.amount * f.ncv * f.ef * f.oxidation * (1 - f.biomassShare);
                  return (
                    <tr key={i}>
                      <td><input className="form-input text-xs" style={{ minWidth: 120 }} value={f.name}
                        onChange={e => dispatch(updateFuel({ index: i, data: { name: e.target.value } }))} /></td>
                      <td><input type="number" className="form-input font-mono text-xs w-24" value={f.amount}
                        onChange={e => dispatch(updateFuel({ index: i, data: { amount: +e.target.value } }))} /></td>
                      <td>
                        <select className="form-select text-xs w-20" value={f.unit}
                          onChange={e => dispatch(updateFuel({ index: i, data: { unit: e.target.value } }))}>
                          <option>Nm³</option><option>ton</option><option>GJ</option>
                        </select>
                      </td>
                      <td><input type="number" className="form-input font-mono text-xs w-24" value={f.ncv} step="0.0000001"
                        onChange={e => dispatch(updateFuel({ index: i, data: { ncv: +e.target.value } }))} /></td>
                      <td><input type="number" className="form-input font-mono text-xs w-20" value={f.ef}
                        onChange={e => dispatch(updateFuel({ index: i, data: { ef: +e.target.value } }))} /></td>
                      <td><input type="number" className="form-input font-mono text-xs w-16" value={f.oxidation} step="0.01" min="0" max="1"
                        onChange={e => dispatch(updateFuel({ index: i, data: { oxidation: +e.target.value } }))} /></td>
                      <td><input type="number" className="form-input font-mono text-xs w-16" value={f.biomassShare} step="0.01" min="0" max="1"
                        onChange={e => dispatch(updateFuel({ index: i, data: { biomassShare: +e.target.value } }))} /></td>
                      <td><span className="badge badge-primary font-mono">{em.toFixed(3)}</span></td>
                      <td><button className="btn btn-ghost btn-sm" onClick={() => dispatch(removeFuel(i))}>✕</button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button className="btn btn-ghost btn-sm mt-3" onClick={() => dispatch(addFuel())}>+ Yakıt Ekle</button>
        </div>
      )}

      {/* ── Electricity ── */}
      {tab === 'electricity' && (
        <div className="card">
          <div className="font-semibold text-slate-200 mb-1">2) Dolaylı Emisyon — Elektrik</div>
          <div className="text-xs font-mono text-slate-500 mb-3">Türkiye Grid: 0.4437 tCO₂e/MWh · Kardemir EPD: Yerinde 1.8 / Grid 0.91 kgCO₂e/kWh</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-2 border border-white/[0.08] rounded-xl p-4 flex flex-col gap-3">
              <div className="text-xs font-bold text-slate-400">🔌 Toplam Elektrik (Ort. EF)</div>
              <div className="flex flex-col gap-1">
                <label className="form-label">Toplam kWh</label>
                <input type="number" className="form-input font-mono" value={electricity.totalKwh}
                  onChange={e => dispatch(setElectricity({ totalKwh: +e.target.value }))} />
                <div className="form-hint">0 → yerinde/grid ayrımı kullanılır</div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="form-label">Ort. EF (kgCO₂e/kWh)</label>
                <input type="number" className="form-input font-mono" value={electricity.avgEf} step="0.01"
                  onChange={e => dispatch(setElectricity({ avgEf: +e.target.value }))} />
              </div>
            </div>
            <div className="bg-surface-2 border border-white/[0.08] rounded-xl p-4 flex flex-col gap-3">
              <div className="text-xs font-bold text-slate-400">🏭 Yerinde / Grid Ayrımı</div>
              {[
                { label: 'Yerinde (kWh)', key: 'onsiteKwh' as const, ef: 'onsiteEf' as const },
                { label: 'Grid (kWh)',    key: 'gridKwh'   as const, ef: 'gridEf'   as const },
              ].map(row => (
                <div key={row.key} className="flex gap-3">
                  <div className="flex-[2] flex flex-col gap-1">
                    <label className="form-label">{row.label}</label>
                    <input type="number" className="form-input font-mono" value={electricity[row.key]}
                      onChange={e => dispatch(setElectricity({ [row.key]: +e.target.value }))} />
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <label className="form-label">EF</label>
                    <input type="number" className="form-input font-mono" value={electricity[row.ef]} step="0.01"
                      onChange={e => dispatch(setElectricity({ [row.ef]: +e.target.value }))} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 bg-surface-2 border border-white/[0.08] rounded-lg px-4 py-3 text-sm text-slate-400">
            Hesaplanan elektrik emisyonu:{' '}
            <strong className="font-mono text-primary">
              {electricity.totalKwh > 0
                ? (electricity.totalKwh * electricity.avgEf / 1000).toFixed(3)
                : ((electricity.onsiteKwh * electricity.onsiteEf + electricity.gridKwh * electricity.gridEf) / 1000).toFixed(3)
              } tCO₂e
            </strong>
          </div>
        </div>
      )}

      {/* ── Precursor ── */}
      {tab === 'precursor' && (
        <div className="card">
          <div className="font-semibold text-slate-200 mb-1">3) Precursor / Hammadde Gömülü Emisyonları</div>
          <div className="text-xs font-mono text-slate-500 mb-3">Formül: Miktar (ton) × EF (tCO₂e/ton)</div>
          <div className="alert alert-info mb-4"><span>ℹ️</span> Çelik billet tipik EF: 2.1 tCO₂e/ton. Tedarikçiden EPD belgesi alın.</div>
          <table className="data-table">
            <thead><tr><th>Precursor</th><th>Miktar (ton)</th><th>EF (tCO₂e/ton)</th><th>Emisyon</th><th>Not</th><th/></tr></thead>
            <tbody>
              {precursors.map((p, i) => (
                <tr key={i}>
                  <td><input className="form-input text-xs" value={p.name}
                    onChange={e => dispatch(updatePrecursor({ index: i, data: { name: e.target.value } }))} /></td>
                  <td><input type="number" className="form-input font-mono text-xs w-24" value={p.amountTon}
                    onChange={e => dispatch(updatePrecursor({ index: i, data: { amountTon: +e.target.value } }))} /></td>
                  <td><input type="number" className="form-input font-mono text-xs w-24" value={p.ef} step="0.01"
                    onChange={e => dispatch(updatePrecursor({ index: i, data: { ef: +e.target.value } }))} /></td>
                  <td><span className="badge badge-warning font-mono">{(p.amountTon * p.ef).toFixed(3)}</span></td>
                  <td><input className="form-input text-xs" placeholder="Not..." value={p.note ?? ''}
                    onChange={e => dispatch(updatePrecursor({ index: i, data: { note: e.target.value } }))} /></td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => dispatch(removePrecursor(i))}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="btn btn-ghost btn-sm mt-3" onClick={() => dispatch(addPrecursor())}>+ Precursor Ekle</button>
        </div>
      )}

      {/* ── Transport ── */}
      {tab === 'transport' && (
        <div className="card">
          <div className="font-semibold text-slate-200 mb-1">4) Taşıma Emisyonları — DEFRA EF</div>
          <div className="text-xs font-mono text-slate-500 mb-3">Formül: Kütle × Mesafe × EF / 1000 = tCO₂e</div>
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg px-4 py-2.5 font-mono text-xs text-slate-400 mb-4">
            DEFRA: Karayolu 0.062 · Demiryolu 0.022 · Deniz 0.011 · Hava 1.020 kgCO₂e/t-km
          </div>
          <table className="data-table">
            <thead><tr><th>Mod</th><th>Kütle (ton)</th><th>Mesafe (km)</th><th>EF (kgCO₂e/t-km)</th><th>Emisyon</th></tr></thead>
            <tbody>
              {transport.map((t, i) => {
                const em = t.massTon * t.distanceKm * t.efKgPerTkm / 1000;
                return (
                  <tr key={i}>
                    <td>
                      <select className="form-select text-xs w-28" value={t.mode}
                        onChange={e => dispatch(updateTransport({ index: i, data: { mode: e.target.value } }))}>
                        <option>Karayolu</option><option>Demiryolu</option><option>Deniz</option><option>Hava</option>
                      </select>
                    </td>
                    <td><input type="number" className="form-input font-mono text-xs w-24" value={t.massTon}
                      onChange={e => dispatch(updateTransport({ index: i, data: { massTon: +e.target.value } }))} /></td>
                    <td><input type="number" className="form-input font-mono text-xs w-24" value={t.distanceKm}
                      onChange={e => dispatch(updateTransport({ index: i, data: { distanceKm: +e.target.value } }))} /></td>
                    <td><input type="number" className="form-input font-mono text-xs w-24" value={t.efKgPerTkm} step="0.001"
                      onChange={e => dispatch(updateTransport({ index: i, data: { efKgPerTkm: +e.target.value } }))} /></td>
                    <td><span className={`badge font-mono ${em > 0 ? 'badge-warning' : 'badge-ghost'}`}>{em.toFixed(3)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Results ── */}
      {tab === 'results' && (
        <div className="flex flex-col gap-4">
          {!result ? (
            <div className="card text-center py-16 text-slate-400">
              <div className="text-5xl mb-3">⚗</div>
              <div className="mb-4">Henüz hesaplama yapılmadı.</div>
              <button className="btn btn-primary" onClick={handleCalculate}>Hesapla</button>
            </div>
          ) : (
            <>
              <div className={`alert ${result.isDefaultUsed ? 'alert-warning' : 'alert-success'}`}>
                <span>{result.isDefaultUsed ? '⚠️' : '✅'}</span>
                <span>Yöntem: <strong>{result.calculationMethod === 'actual_data' ? 'Gerçek Veri' : 'Default/EPD'}</strong></span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: 'Doğrudan (Yakıt)',    val: formatTCO2(result.directFuel),     col: 'text-blue-400' },
                  { label: 'Dolaylı (Elektrik)',   val: formatTCO2(result.electricity),    col: 'text-emerald-400' },
                  { label: 'Precursor',            val: formatTCO2(result.precursorTotal), col: 'text-amber-400' },
                  { label: 'Taşıma',              val: formatTCO2(result.transportTotal), col: 'text-purple-400' },
                  { label: 'TOPLAM Emisyon',       val: formatTCO2(result.totalEmbedded),  col: 'text-slate-100', span: 2 },
                  { label: 'Spesifik Emisyon',     val: `${result.specificEmbedded.toFixed(6)} tCO₂e/ton`, col: 'text-primary', span: 2 },
                  { label: 'EPD Benchmark',        val: `${result.epdBenchmarkSpecific} tCO₂e/ton`,         col: 'text-purple-400' },
                  { label: 'EPD Farkı',            val: `${result.diffVsEpd > 0 ? '+' : ''}${result.diffVsEpd.toFixed(6)}`, col: result.status === 'above' ? 'text-red-400' : 'text-emerald-400' },
                  { label: 'CBAM Sertifika',       val: `${formatNum(result.certificatesRequired, 2)} adet`, col: 'text-amber-400' },
                  { label: 'CBAM Maliyet',         val: formatEur(result.cbamCostEur), col: 'text-red-400', span: 2 },
                  { label: 'Bağımlı (Grid)',        val: formatTCO2(result.dependentEmissions), col: 'text-slate-400' },
                  { label: 'Bağımsız',             val: formatTCO2(result.independentEmissions), col: 'text-slate-400' },
                ].map((r, i) => (
                  <div key={i} className={`stat-card ${(r as { span?: number }).span === 2 ? 'col-span-2' : ''}`}>
                    <div className="stat-label">{r.label}</div>
                    <div className={`font-bold font-mono text-base ${r.col}`}>{r.val}</div>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">📋 Hesaplama Detayı</div>
                <pre className="font-mono text-xs text-slate-400 bg-bg border border-white/[0.06] rounded-lg p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">
{`Yakıt: ${formatTCO2(result.directFuel)}
Elektrik: ${formatTCO2(result.electricity)}
Precursor: ${formatTCO2(result.precursorTotal)}
Taşıma: ${formatTCO2(result.transportTotal)}
─────────────────
TOPLAM: ${formatTCO2(result.totalEmbedded)}
Üretim: ${formatNum(production, 0)} ton
Spesifik: ${result.specificEmbedded.toFixed(6)} tCO₂e/ton
─────────────────
EPD Benchmark: 2.29 tCO₂e/ton
Fark: ${result.diffVsEpd.toFixed(6)} tCO₂e/ton
─────────────────
ETS: €${etsPrice}/tCO₂e
CBAM Maliyet: ${formatEur(result.cbamCostEur)}`}
                </pre>
              </div>
              <div className="flex gap-3">
                <button className="btn btn-accent" onClick={handleSave} disabled={saving}>
                  {saving ? '...' : '☁️ Supabase\'e Kaydet'}
                </button>
                <button className="btn btn-ghost" onClick={() => navigate('/reports')}>
                  ↓ Rapor Oluştur
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
