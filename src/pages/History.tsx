import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import {
  useGetCalculationsQuery,
  useDeleteCalculationMutation,
} from '../store/api';
import { formatEur, formatNum } from '../engine/cbam';
import type { DbCalculation } from '../lib/supabase';

export default function History() {
  const navigate = useNavigate();
  const { company } = useAppSelector(s => s.cbam);
  const [selected, setSelected] = useState<DbCalculation | null>(null);

  const { data: calculations, isLoading, isError, refetch } = useGetCalculationsQuery(company.name);
  const [deleteCalc, { isLoading: isDeleting }] = useDeleteCalculationMutation();

  const handleDelete = async (id: string) => {
    if (!confirm('Bu hesaplamayı silmek istediğinize emin misiniz?')) return;
    await deleteCalc(id);
    if (selected?.id === id) setSelected(null);
  };

  return (
    <div className="flex flex-col gap-5 p-6 max-w-6xl animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100">🕑 Hesaplama Geçmişi</h1>
          <p className="text-xs text-slate-500 mt-1">Supabase PostgreSQL · {company.name} firmasi kayıtları</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost btn-sm" onClick={() => refetch()}>↺ Yenile</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/calculator')}>+ Yeni Hesaplama</button>
        </div>
      </div>

      {/* Supabase Connection Banner */}
      <div className="alert alert-info">
        <span>🗄️</span>
        <div>
          <strong>Supabase PostgreSQL Bağlantısı</strong> —
          {isError
            ? ' Bağlantı kurulamadı. .env dosyasına VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY ekleyin.'
            : isLoading
            ? ' Yükleniyor...'
            : ` ${calculations?.length ?? 0} kayıt bulundu.`
          }
        </div>
        {isError && (
          <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm flex-shrink-0">
            Supabase Aç →
          </a>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="spinner w-8 h-8" />
        </div>
      )}

      {isError && (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">🗄️</div>
          <div className="text-slate-300 font-semibold mb-2">Supabase bağlantısı kurulamadı</div>
          <div className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Lütfen proje kök dizininde bir <code className="bg-surface-2 px-1.5 py-0.5 rounded text-primary">.env</code> dosyası oluşturun:
          </div>
          <pre className="bg-bg border border-white/[0.08] rounded-xl px-6 py-4 text-sm font-mono text-emerald-400 text-left inline-block">
{`VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...`}
          </pre>
          <div className="mt-4 text-xs text-slate-500">
            Supabase tablo şeması için:{' '}
            <code className="bg-surface-2 px-1.5 py-0.5 rounded text-primary">supabase/schema.sql</code> dosyasını çalıştırın.
          </div>
        </div>
      )}

      {!isLoading && !isError && calculations && (
        <div className="grid grid-cols-[1fr_380px] gap-5 items-start">
          {/* Table */}
          <div className="card overflow-hidden p-0">
            {calculations.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <div className="text-4xl mb-3">📭</div>
                <div>Henüz kayıt yok. Hesaplama yapıp kaydedin.</div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dönem</th><th>Üretim</th><th>Toplam tCO₂e</th>
                    <th>Spesifik</th><th>CBAM €</th><th>Yöntem</th><th>Tarih</th><th/>
                  </tr>
                </thead>
                <tbody>
                  {calculations.map(c => (
                    <tr key={c.id}
                      className={`cursor-pointer ${selected?.id === c.id ? 'bg-blue-500/8' : ''}`}
                      onClick={() => setSelected(c)}>
                      <td><span className="badge badge-ghost">{c.period}</span></td>
                      <td className="font-mono">{formatNum(c.production_ton,0)}</td>
                      <td className="font-mono text-primary">{c.total_embedded_tco2.toFixed(2)}</td>
                      <td className="font-mono text-xs">{c.specific_embedded.toFixed(4)}</td>
                      <td className="font-mono text-red-400">{formatEur(c.cbam_cost_eur)}</td>
                      <td>
                        <span className={`badge ${c.is_default_used ? 'badge-warning' : 'badge-accent'}`}>
                          {c.is_default_used ? 'Default' : 'Gerçek Veri'}
                        </span>
                      </td>
                      <td className="text-xs text-slate-500 font-mono">
                        {c.created_at ? new Date(c.created_at).toLocaleDateString('tr-TR') : '—'}
                      </td>
                      <td>
                        <button className="btn btn-ghost btn-sm text-red-400 hover:text-red-300"
                          disabled={isDeleting}
                          onClick={e => { e.stopPropagation(); handleDelete(c.id); }}>
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Detail Panel */}
          {selected ? (
            <div className="card flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">📋 Detay</div>
                <button className="text-slate-500 hover:text-slate-300 text-lg" onClick={() => setSelected(null)}>✕</button>
              </div>

              <div className="flex flex-col gap-2">
                {[
                  ['Dönem', selected.period],
                  ['Üretim', `${formatNum(selected.production_ton,0)} ton`],
                  ['Toplam Emisyon', `${selected.total_embedded_tco2.toFixed(4)} tCO₂e`],
                  ['Spesifik', `${selected.specific_embedded.toFixed(6)} tCO₂e/ton`],
                  ['EPD Benchmark', `${selected.epd_benchmark} tCO₂e/ton`],
                  ['EPD Durumu', selected.status === 'above' ? '▲ Üstünde' : '▼ Altında'],
                  ['CBAM Sertifika', `${(selected.cbam_cost_eur / selected.ets_price).toFixed(2)} adet`],
                  ['CBAM Maliyet', formatEur(selected.cbam_cost_eur)],
                  ['ETS Fiyatı', `€${selected.ets_price}/tCO₂e`],
                  ['Yöntem', selected.is_default_used ? '⚠️ Default' : '✅ Gerçek Veri'],
                  ['Şehir', selected.city],
                ].map(([k,v],i) => (
                  <div key={i} className="flex justify-between text-xs text-slate-400 py-1.5 border-b border-white/[0.05] last:border-0">
                    <span>{k}</span>
                    <strong className="font-mono text-slate-200">{v}</strong>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-surface-2 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 mb-1">Doğrudan</div>
                  <div className="font-mono text-sm text-blue-400">{selected.direct_fuel_tco2.toFixed(4)}</div>
                </div>
                <div className="bg-surface-2 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 mb-1">Elektrik</div>
                  <div className="font-mono text-sm text-emerald-400">{selected.electricity_tco2.toFixed(4)}</div>
                </div>
                <div className="bg-surface-2 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 mb-1">Precursor</div>
                  <div className="font-mono text-sm text-amber-400">{selected.precursor_tco2.toFixed(4)}</div>
                </div>
                <div className="bg-surface-2 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 mb-1">Taşıma</div>
                  <div className="font-mono text-sm text-purple-400">{selected.transport_tco2.toFixed(4)}</div>
                </div>
              </div>

              <div className="text-[10px] text-slate-600">
                ID: {selected.id}<br />
                Kaydedildi: {selected.created_at ? new Date(selected.created_at).toLocaleString('tr-TR') : '—'}
              </div>
            </div>
          ) : (
            <div className="card text-center py-10 text-slate-600">
              <div className="text-2xl mb-2">👆</div>
              <div className="text-sm">Detay görmek için tablo satırına tıklayın</div>
            </div>
          )}
        </div>
      )}

      {/* Schema hint */}
      <div className="card bg-surface-glow border-blue-500/20">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">🗄️ Supabase Kurulum Rehberi</div>
        <ol className="text-xs text-slate-400 flex flex-col gap-2 list-decimal list-inside">
          <li><a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-primary">supabase.com</a>'da ücretsiz proje oluştur</li>
          <li>SQL Editor'de <code className="bg-surface-2 px-1 rounded">supabase/schema.sql</code> dosyasını çalıştır</li>
          <li>Project Settings → API → URL ve anon key'i kopyala</li>
          <li>Proje kökünde <code className="bg-surface-2 px-1 rounded">.env</code> dosyası oluştur ve key'leri yapıştır</li>
          <li><code className="bg-surface-2 px-1 rounded">npm run dev</code> ile yeniden başlat</li>
        </ol>
      </div>
    </div>
  );
}
