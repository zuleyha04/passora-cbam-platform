import { useAppSelector } from '../store';
import { formatEur, formatNum, formatTCO2, ETS_PRICE_EUR } from '../engine/cbam';

function now() {
  return new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Reports() {
  const { result, company, production, period, suppliers, recommendations } = useAppSelector(s => s.cbam);

  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    if (!result) return;
    const rows = [
      ['Alan','Değer','Birim'],
      ['Firma', company.name,''],['Dönem', period,''],['Üretim', production,'ton'],
      ['Toplam Emisyon', result.totalEmbedded,'tCO2e'],
      ['Spesifik', result.specificEmbedded,'tCO2e/ton'],
      ['Doğrudan', result.directFuel,'tCO2e'],['Elektrik', result.electricity,'tCO2e'],
      ['Precursor', result.precursorTotal,'tCO2e'],['Taşıma', result.transportTotal,'tCO2e'],
      ['EPD Benchmark', result.epdBenchmarkSpecific,'tCO2e/ton'],
      ['CBAM Sertifika', result.certificatesRequired,'adet'],
      ['CBAM Maliyet', result.cbamCostEur,'EUR'],
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8' }));
    a.download = `passora_cbam_${period}.csv`; a.click();
  };

  const handleExportJSON = () => {
    if (!result) return;
    const data = { company, period, production, result, suppliers, recommendations, generatedAt: new Date().toISOString() };
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)], { type:'application/json' }));
    a.download = `passora_cbam_${period}.json`; a.click();
  };

  return (
    <div className="flex flex-col gap-5 p-6 max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">↓ Raporlar & Çıktılar</h1>
          <p className="text-xs text-slate-500 mt-1">CBAM uyumlu denetime hazır rapor · {now()}</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={handleExportCSV} disabled={!result}>⬇ CSV</button>
          <button className="btn btn-ghost btn-sm" onClick={handleExportJSON} disabled={!result}>⬇ JSON</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>🖨 PDF / Yazdır</button>
        </div>
      </div>

      {!result ? (
        <div className="card text-center py-20 text-slate-600">
          <div className="text-5xl mb-3">↓</div>
          <div>Rapor oluşturmak için önce hesaplama yapın.</div>
        </div>
      ) : (
        <div className="bg-surface border border-black/[0.08] rounded-2xl p-8 flex flex-col gap-0" id="cbam-report">
          {/* Report Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg"
                style={{ background:'linear-gradient(135deg,#3b82f6,#1d4ed8)' }}>P</div>
              <div>
                <div className="font-extrabold tracking-widest text-slate-900">PASSORA</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">AI-Guided CBAM Compliance Platform</div>
              </div>
            </div>
            <div className="flex flex-col gap-1 text-right">
              <div className="text-xs text-slate-500">Tarih: <strong className="text-slate-700">{now()}</strong></div>
              <div className="text-xs text-slate-500">Dönem: <strong className="text-slate-700">{period}</strong></div>
              <div className="text-xs text-slate-500">Versiyon: <strong className="text-slate-700">1.0</strong></div>
            </div>
          </div>

          <hr className="border-black/[0.08] mb-6" />

          {/* 1. Firma */}
          <section className="mb-6">
            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">1. Firma Bilgileri</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['Firma Adı', company.name], ['Vergi No', company.taxNo], ['Şehir', company.city],
                ['Sektör', company.sector], ['Dönem', period], ['CN Kodu', '7216 Demir-Çelik Profil'],
              ].map(([k, v], i) => (
                <div key={i} className="bg-surface-2 rounded-lg px-3 py-2.5">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{k}</div>
                  <div className="text-sm font-semibold text-slate-900">{v}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 2. Emisyon Özeti */}
          <section className="mb-6">
            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">2. Emisyon Özeti</div>
            <table className="data-table">
              <thead><tr><th>Bileşen</th><th>tCO₂e</th><th>Pay</th><th>Kaynak</th></tr></thead>
              <tbody>
                {[
                  { name:'Doğrudan (Yakıt/Proses)', val:result.directFuel,     src:'IPCC 2006 / AB MRR' },
                  { name:'Dolaylı (Elektrik)',       val:result.electricity,     src:'TEIAS / Kardemir EPD' },
                  { name:'Precursor Gömülü',         val:result.precursorTotal,  src:'Tedarikçi / EU Default' },
                  { name:'Taşıma (A4)',              val:result.transportTotal,  src:'DEFRA 2025' },
                ].map((r,i) => (
                  <tr key={i}>
                    <td>{r.name}</td>
                    <td className="font-mono">{r.val.toFixed(4)}</td>
                    <td className="font-mono">{((r.val/result.totalEmbedded)*100).toFixed(1)}%</td>
                    <td className="text-slate-500 text-xs">{r.src}</td>
                  </tr>
                ))}
                <tr className="bg-blue-500/5 font-bold">
                  <td>TOPLAM Gömülü Emisyon</td>
                  <td className="font-mono">{result.totalEmbedded.toFixed(4)}</td>
                  <td className="font-mono">100%</td>
                  <td/>
                </tr>
              </tbody>
            </table>
            <div className="mt-3 flex flex-col gap-2 bg-blue-500/5 border border-blue-500/15 rounded-lg px-4 py-3">
              {[
                ['Spesifik Emisyon', `${result.specificEmbedded.toFixed(6)} tCO₂e/ton`],
                ['Üretim', `${formatNum(production,0)} ton`],
                ['Hesaplama Yöntemi', result.calculationMethod === 'actual_data' ? 'Gerçek Veri' : 'Default/EPD'],
              ].map(([k,v],i) => (
                <div key={i} className="flex justify-between text-sm text-slate-600">
                  <span>{k}:</span>
                  <strong className="font-mono text-slate-900">{v}</strong>
                </div>
              ))}
              {result.isDefaultUsed && <span className="badge badge-warning self-start">⚠️ Tahmini Değer</span>}
            </div>
          </section>

          {/* 3. Bağımlı / Bağımsız */}
          <section className="mb-6">
            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">3. Bağımlı / Bağımsız Emisyon</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon:'🔗', title:'Bağımlı', val: result.dependentEmissions, desc:'Grid elektrik — dışarıdan satın alınan enerji' },
                { icon:'🔋', title:'Bağımsız', val: result.independentEmissions, desc:'Yerinde üretim & yakıt & precursor' },
              ].map((d,i) => (
                <div key={i} className="bg-surface-2 border border-black/[0.08] rounded-xl p-4">
                  <div className="text-xs font-bold text-slate-600 mb-2">{d.icon} {d.title} Emisyon</div>
                  <div className="text-xl font-bold font-mono text-slate-900 mb-1">{formatTCO2(d.val)}</div>
                  <div className="text-xs text-slate-500">{d.desc}</div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. EPD */}
          <section className="mb-6">
            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">4. EPD Benchmark Karşılaştırması</div>
            <div className="flex flex-col gap-2 bg-surface-2 border border-black/[0.08] rounded-xl px-4 py-3">
              {[
                ['Hesaplanan Spesifik', `${result.specificEmbedded.toFixed(6)} tCO₂e/ton`],
                ['Kardemir EPD A1-A3', '2.290000 tCO₂e/ton'],
                ['Fark', `${result.diffVsEpd > 0 ? '+' : ''}${result.diffVsEpd.toFixed(6)} tCO₂e/ton`],
              ].map(([k,v],i) => (
                <div key={i} className="flex justify-between items-center text-sm text-slate-600 py-1 border-b border-black/[0.05] last:border-0">
                  <span>{k}:</span>
                  <strong className="font-mono" style={{ color: i === 2 ? (result.status==='above'?'#ef4444':'#10b981') : '#0f172a' }}>{v}</strong>
                </div>
              ))}
              <div className="flex justify-between items-center text-sm text-slate-600 pt-1">
                <span>Durum:</span>
                <span className={`badge ${result.status==='above'?'badge-danger':'badge-accent'}`}>
                  {result.status==='above' ? '▲ EPD Üstünde' : '▼ EPD Altında'}
                </span>
              </div>
            </div>
          </section>

          {/* 5. CBAM Maliyet */}
          <section className="mb-6">
            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">5. CBAM Maliyet Analizi</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                ['CBAM Sertifika', `${formatNum(result.certificatesRequired,4)} adet`],
                ['ETS Birim Fiyatı (Q1 2026)', `€${ETS_PRICE_EUR}/tCO₂e`],
                ['Toplam CBAM Maliyeti', formatEur(result.cbamCostEur)],
                ['Tahmini Yıllık Maliyet', formatEur(result.cbamCostEur*4)],
              ].map(([k,v],i) => (
                <div key={i} className="flex justify-between items-center bg-surface-2 border border-black/[0.08] rounded-lg px-4 py-3 text-sm text-slate-600">
                  <span>{k}:</span>
                  <strong className="font-mono text-slate-900">{v}</strong>
                </div>
              ))}
            </div>
          </section>

          {/* 6. Tedarikçi */}
          <section className="mb-6">
            <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">6. Tedarikçi Karması</div>
            <table className="data-table">
              <thead><tr><th>Tedarikçi</th><th>Teknoloji</th><th>Ülke</th><th>Pay</th><th>EF</th><th>Ağırlıklı EF</th></tr></thead>
              <tbody>
                {suppliers.map((s,i) => (
                  <tr key={i}>
                    <td className="font-semibold">{s.name}</td>
                    <td><span className={`badge ${s.type==='BOF'?'badge-danger':'badge-accent'}`}>{s.type}</span></td>
                    <td>{s.country}</td>
                    <td className="font-mono">{s.share}%</td>
                    <td className="font-mono">{s.specificEf}</td>
                    <td className="font-mono">{((s.share/100)*s.specificEf).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* 7. AI Öneriler */}
          {recommendations.length > 0 && (
            <section className="mb-6">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-3">7. AI Öneri Özeti</div>
              <div className="flex flex-col gap-2">
                {recommendations.map((r,i) => (
                  <div key={i} className="flex items-center gap-3 bg-surface-2 rounded-lg px-4 py-2.5">
                    <span className={`badge ${SEV_COLOR[r.severity]} flex-shrink-0`}>
                      {r.severity==='high'?'Yüksek':r.severity==='medium'?'Orta':'Düşük'}
                    </span>
                    <span className="text-sm text-slate-800 flex-1">{r.title.replace(/[⚠️📊☀️🚂🏭🔥💡]/g,'').trim()}</span>
                    {r.potentialSavingEur && (
                      <span className="text-xs font-mono text-emerald-400 flex-shrink-0">{formatEur(r.potentialSavingEur)}</span>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Footer */}
          <div className="pt-4 border-t border-black/[0.06] text-center flex flex-col gap-1">
            <div className="text-[10px] text-slate-600">Bu rapor PASSORA CBAM Uyum Platformu tarafından otomatik oluşturulmuştur.</div>
            <div className="text-[10px] text-slate-600">Ref: CBAM Reg. (EU) 2023/956 · DEFRA 2025 · IPCC 2006 · Kardemir EPD</div>
            {result.isDefaultUsed && <div className="text-[10px] text-amber-600">⚠️ Veriler kısmen varsayılan değer içermektedir.</div>}
          </div>
        </div>
      )}
    </div>
  );
}

const SEV_COLOR = { high: 'badge-danger', medium: 'badge-warning', low: 'badge-accent' } as const;
