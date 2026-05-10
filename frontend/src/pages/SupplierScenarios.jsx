import PageContainer from '../components/layout/PageContainer'
import { SupplierScenarioTable, SupplierEmissionChart, SupplierCostEmissionChart } from '../components/suppliers/SupplierComponents'
import { MOCK_SUPPLIERS } from '../data/mockData'

export default function SupplierScenarios() {
  const current = MOCK_SUPPLIERS.find(s => s.is_current)
  const currentEmission = current ? current.amount_ton * current.emission_factor_tco2e_per_ton : 0
  const best = [...MOCK_SUPPLIERS].sort((a, b) => a.emission_factor_tco2e_per_ton - b.emission_factor_tco2e_per_ton)[0]
  const bestEmission = best ? best.amount_ton * best.emission_factor_tco2e_per_ton : 0
  const saving = Math.round(currentEmission - bestEmission)

  return (
    <PageContainer title="Tedarikçi Senaryo Analizi" subtitle="Alternatif hammadde tedarikçilerinin karbon ve maliyet etkisi">

      {/* Özet kart */}
      {saving > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
          border: '1px solid #BBF7D0', borderRadius: 12,
          padding: '20px 24px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <span style={{ fontSize: 40 }}>🌿</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#166534', marginBottom: 4 }}>
              En İyi Tedarikçi Seçilirse Potansiyel Karbon Azaltımı
            </p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#16A34A' }}>
              {saving.toLocaleString('tr-TR')} tCO₂e
            </p>
            <p style={{ fontSize: 12, color: '#166534', marginTop: 2 }}>
              {best?.name} seçilirse mevcut tedarikçiye göre bu kadar azaltım sağlanabilir.
            </p>
          </div>
        </div>
      )}

      {/* Tablo */}
      <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid #F1F5F9' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1E293B', marginBottom: 2 }}>Tedarikçi Karşılaştırma Tablosu</p>
          <p style={{ fontSize: 12, color: '#94A3B8' }}>Mevcut hammadde farklı bir tedarikçiden alınsaydı ne olurdu?</p>
        </div>
        <SupplierScenarioTable rows={MOCK_SUPPLIERS} />
      </div>

      {/* Grafikler */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <SupplierEmissionChart rows={MOCK_SUPPLIERS} />
        <SupplierCostEmissionChart rows={MOCK_SUPPLIERS} />
      </div>

      {/* Metodoloji notu */}
      <div style={{ marginTop: 20, padding: '12px 16px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 9, fontSize: 12, color: '#92400E' }}>
        ⚠️ Bu analiz karar destek amaçlıdır. Tedarikçi seçiminde teknik, ticari ve lojistik faktörler de değerlendirilmelidir.
      </div>
    </PageContainer>
  )
}
