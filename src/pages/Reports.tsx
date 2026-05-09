import { useApp } from '../context/AppContext';
import { formatEur, formatNum, formatTCO2, ETS_PRICE_EUR } from '../engine/cbam';
import styles from './Reports.module.css';

function now() {
  return new Date().toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Reports() {
  const { state } = useApp();
  const { result, company, production, period, suppliers, recommendations } = state;

  const handlePrint = () => window.print();

  const handleExportJSON = () => {
    if (!result) return;
    const data = { company, period, production, result, suppliers, recommendations, generatedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `passora_cbam_${period}.json`; a.click();
  };

  const handleExportCSV = () => {
    if (!result) return;
    const rows = [
      ['Alan', 'Değer', 'Birim'],
      ['Firma', company.name, ''],
      ['Dönem', period, ''],
      ['Üretim', production, 'ton'],
      ['Toplam Emisyon', result.totalEmbedded, 'tCO2e'],
      ['Spesifik Emisyon', result.specificEmbedded, 'tCO2e/ton'],
      ['Doğrudan Emisyon', result.directFuel, 'tCO2e'],
      ['Dolaylı Emisyon', result.electricity, 'tCO2e'],
      ['Precursor Emisyonu', result.precursorTotal, 'tCO2e'],
      ['Taşıma Emisyonu', result.transportTotal, 'tCO2e'],
      ['EPD Benchmark', result.epdBenchmarkSpecific, 'tCO2e/ton'],
      ['EPD Durumu', result.status, ''],
      ['CBAM Sertifika', result.certificatesRequired, 'adet'],
      ['CBAM Maliyet', result.cbamCostEur, 'EUR'],
      ['Hesaplama Yöntemi', result.calculationMethod, ''],
    ];
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `passora_cbam_${period}.csv`; a.click();
  };

  return (
    <div className={styles.reports}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>↓ Raporlar & Çıktılar</h1>
          <p className={styles.sub}>CBAM uyumlu denetime hazır rapor · {now()}</p>
        </div>
        <div className={styles.actions}>
          <button className="btn btn-ghost btn-sm" onClick={handleExportCSV} disabled={!result}>⬇ CSV</button>
          <button className="btn btn-ghost btn-sm" onClick={handleExportJSON} disabled={!result}>⬇ JSON</button>
          <button className="btn btn-primary btn-sm" onClick={handlePrint}>🖨 Yazdır / PDF</button>
        </div>
      </div>

      {!result ? (
        <div className="card" style={{ textAlign: 'center', padding: '64px 32px', color: 'var(--color-text-2)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>↓</div>
          <div>Rapor oluşturmak için önce hesaplama yapın.</div>
        </div>
      ) : (
        <div className={styles.reportDoc} id="cbam-report">
          {/* Report Header */}
          <div className={styles.docHeader}>
            <div className={styles.docLogo}>
              <div className={styles.docLogoMark}>P</div>
              <div>
                <div className={styles.docLogoName}>PASSORA</div>
                <div className={styles.docLogoSub}>AI-Guided CBAM Compliance Platform</div>
              </div>
            </div>
            <div className={styles.docMeta}>
              <div className={styles.docMetaItem}><span>Tarih:</span><strong>{now()}</strong></div>
              <div className={styles.docMetaItem}><span>Dönem:</span><strong>{period}</strong></div>
              <div className={styles.docMetaItem}><span>Versiyon:</span><strong>1.0</strong></div>
            </div>
          </div>

          <hr className="divider" />

          {/* Company Info */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>1. Firma Bilgileri</div>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}><span>Firma Adı</span><strong>{company.name}</strong></div>
              <div className={styles.infoItem}><span>Vergi No</span><strong>{company.taxNo}</strong></div>
              <div className={styles.infoItem}><span>Şehir</span><strong>{company.city}</strong></div>
              <div className={styles.infoItem}><span>Sektör</span><strong>{company.sector}</strong></div>
              <div className={styles.infoItem}><span>Raporlama Dönemi</span><strong>{period}</strong></div>
              <div className={styles.infoItem}><span>CN Kodu</span><strong>7216 (Demir-Çelik Profil)</strong></div>
            </div>
          </div>

          {/* Emission Summary */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>2. Emisyon Özeti</div>
            <table className="table">
              <thead>
                <tr><th>Emisyon Bileşeni</th><th>Değer (tCO₂e)</th><th>Pay (%)</th><th>Yöntem</th></tr>
              </thead>
              <tbody>
                {[
                  { name: 'Doğrudan Emisyon (Yakıt/Proses)', val: result.directFuel,     src: 'IPCC 2006 / AB MRR' },
                  { name: 'Dolaylı Emisyon (Elektrik)',       val: result.electricity,     src: 'TEIAS / Kardemir EPD' },
                  { name: 'Precursor Gömülü Emisyonları',    val: result.precursorTotal,  src: 'Tedarikçi Verisi / EU Default' },
                  { name: 'Taşıma Emisyonları (A4)',          val: result.transportTotal,  src: 'DEFRA 2025' },
                ].map((r, i) => (
                  <tr key={i}>
                    <td>{r.name}</td>
                    <td className="font-mono">{r.val.toFixed(4)}</td>
                    <td className="font-mono">{((r.val / result.totalEmbedded) * 100).toFixed(1)}%</td>
                    <td style={{ color: 'var(--color-text-3)', fontSize: '0.8rem' }}>{r.src}</td>
                  </tr>
                ))}
                <tr style={{ fontWeight: 700, background: 'rgba(59,130,246,0.05)' }}>
                  <td><strong>TOPLAM Gömülü Emisyon</strong></td>
                  <td className="font-mono"><strong>{result.totalEmbedded.toFixed(4)}</strong></td>
                  <td className="font-mono"><strong>100%</strong></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <div className={styles.specificBox}>
              <div className={styles.specificItem}>
                <span>Spesifik Emisyon:</span>
                <strong className="font-mono">{result.specificEmbedded.toFixed(6)} tCO₂e/ton</strong>
              </div>
              <div className={styles.specificItem}>
                <span>Üretim Miktarı:</span>
                <strong className="font-mono">{formatNum(production, 0)} ton</strong>
              </div>
              <div className={styles.specificItem}>
                <span>Hesaplama Yöntemi:</span>
                <strong>{result.calculationMethod === 'actual_data' ? 'Hesaplama Tabanlı (Gerçek Veri)' : 'Default/EPD Değeri'}</strong>
                {result.isDefaultUsed && <span className="badge badge-warning" style={{ marginLeft: 8 }}>⚠️ Tahmini</span>}
              </div>
            </div>
          </div>

          {/* Bağımlı/Bağımsız */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>3. Bağımlı / Bağımsız Karbon Tüketimi</div>
            <div className={styles.depGrid}>
              <div className={styles.depCard}>
                <div className={styles.depCardTitle}>🔗 Bağımlı Emisyon</div>
                <div className={styles.depCardValue}>{formatTCO2(result.dependentEmissions)}</div>
                <div className={styles.depCardDesc}>Dışarıdan satın alınan elektrik ve ısıdan kaynaklanan emisyonlar (grid elektriği). Enerji sağlayıcısının karbon yoğunluğuna bağlıdır.</div>
              </div>
              <div className={styles.depCard}>
                <div className={styles.depCardTitle}>🔋 Bağımsız Emisyon</div>
                <div className={styles.depCardValue}>{formatTCO2(result.independentEmissions)}</div>
                <div className={styles.depCardDesc}>Kendi üretim süreçlerindeki yakıt kullanımı ve precursor hammadde kaynaklı emisyonlar. Proses kontrolü ile azaltılabilir.</div>
              </div>
            </div>
          </div>

          {/* EPD Benchmark */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>4. EPD Benchmark Karşılaştırması</div>
            <div className={styles.epdBox}>
              <div className={styles.epdRow}>
                <span>Hesaplanan Spesifik Emisyon:</span>
                <strong className="font-mono">{result.specificEmbedded.toFixed(6)} tCO₂e/ton</strong>
              </div>
              <div className={styles.epdRow}>
                <span>Kardemir EPD A1-A3 (Referans):</span>
                <strong className="font-mono">2.290000 tCO₂e/ton</strong>
              </div>
              <div className={styles.epdRow}>
                <span>Fark:</span>
                <strong className="font-mono" style={{ color: result.status === 'above' ? 'var(--color-danger)' : 'var(--color-accent)' }}>
                  {result.diffVsEpd > 0 ? '+' : ''}{result.diffVsEpd.toFixed(6)} tCO₂e/ton
                </strong>
              </div>
              <div className={styles.epdRow}>
                <span>Durum:</span>
                <span className={`badge ${result.status === 'above' ? 'badge-danger' : 'badge-accent'}`}>
                  {result.status === 'above' ? '▲ EPD Benchmark Üstünde' : '▼ EPD Benchmark Altında'}
                </span>
              </div>
            </div>
          </div>

          {/* CBAM Cost */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>5. CBAM Maliyet Analizi</div>
            <div className={styles.costGrid}>
              <div className={styles.costItem}><span>CBAM Sertifika Adedi:</span><strong className="font-mono">{formatNum(result.certificatesRequired, 4)}</strong></div>
              <div className={styles.costItem}><span>ETS Birim Fiyatı (Q1 2026):</span><strong className="font-mono">€{ETS_PRICE_EUR}/tCO₂e</strong></div>
              <div className={styles.costItem}><span>Toplam CBAM Maliyeti:</span><strong className="font-mono" style={{ color: 'var(--color-danger)', fontSize: '1.1rem' }}>{formatEur(result.cbamCostEur)}</strong></div>
              <div className={styles.costItem}><span>Tahmini Yıllık Maliyet:</span><strong className="font-mono">{formatEur(result.cbamCostEur * 4)}</strong></div>
            </div>
          </div>

          {/* Tedarikçi */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>6. Tedarikçi Karması</div>
            <table className="table">
              <thead>
                <tr><th>Tedarikçi</th><th>Teknoloji</th><th>Ülke</th><th>Pay (%)</th><th>EF (tCO₂e/ton)</th><th>Ağırlıklı EF</th></tr>
              </thead>
              <tbody>
                {suppliers.map((s, i) => (
                  <tr key={i}>
                    <td>{s.name}</td>
                    <td><span className={`badge ${s.type === 'BOF' ? 'badge-danger' : 'badge-accent'}`}>{s.type}</span></td>
                    <td>{s.country}</td>
                    <td className="font-mono">{s.share}%</td>
                    <td className="font-mono">{s.specificEf}</td>
                    <td className="font-mono">{((s.share / 100) * s.specificEf).toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recommendations summary */}
          {recommendations.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>7. AI Öneri Özeti</div>
              <div className={styles.recSummaryList}>
                {recommendations.map((r, i) => (
                  <div key={i} className={styles.recSummaryItem}>
                    <span className={`badge ${r.severity === 'high' ? 'badge-danger' : r.severity === 'medium' ? 'badge-warning' : 'badge-accent'}`}>
                      {r.severity === 'high' ? 'Yüksek' : r.severity === 'medium' ? 'Orta' : 'Düşük'}
                    </span>
                    <span className={styles.recSummaryTitle}>{r.title.replace(/[⚠️📊☀️🚂🏭🔥💡]/g, '').trim()}</span>
                    {r.potentialSavingEur && <span className={styles.recSummarySaving}>{formatEur(r.potentialSavingEur)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className={styles.docFooter}>
            <div>Bu rapor PASSORA CBAM Uyum Platformu tarafından otomatik oluşturulmuştur.</div>
            <div>Referans: CBAM Reg. (EU) 2023/956 · DEFRA 2025 · IPCC 2006 · Kardemir EPD</div>
            <div>Veriler {result.isDefaultUsed ? 'kısmen varsayılan değer içermektedir (⚠️ tahmini)' : 'gerçek ölçüm verilerine dayanmaktadır'}.</div>
          </div>
        </div>
      )}
    </div>
  );
}
