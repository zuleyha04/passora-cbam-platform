import { useState, useEffect } from 'react'
import PageContainer from '../components/layout/PageContainer'
import SupplierComparisonTable from '../components/tables/SupplierComparisonTable'
import { SupplierEmissionChart, SupplierCostCarbonChart, CarbonSavingCard } from '../components/charts/SupplierCharts'
import { compareSuppliers } from '../api/cbamApi'
import { DEMO_SUPPLIERS } from '../utils/mockData'

export default function SupplierComparison() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    compareSuppliers(DEMO_SUPPLIERS)
      .then(setResult)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageContainer title="Karbon Akıllı Tedarikçi Karşılaştırması" subtitle="Alternatif tedarikçi senaryolarını karbon ve maliyet boyutuyla değerlendirin">
      <div className="alert alert-info" style={{ marginBottom: 20, fontSize: 12 }}>
        Bu analiz, mevcut hammadde tedarikçisine alternatif seçeneklerin karbon emisyonu ve maliyet etkisini göstermektedir.
        Karar destek amaçlıdır; nihai tedarikçi seçiminde teknik ve ticari faktörler de değerlendirilmelidir.
      </div>

      {loading && <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Yükleniyor...</p>}
      {error && <div className="alert alert-error">{error}</div>}

      {result && (
        <>
          <CarbonSavingCard savingTco2e={result.carbon_saving_tco2e} note={result.carbon_saving_note} />

          <div className="card" style={{ marginTop: 20, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Tedarikçi Karşılaştırma Tablosu</h3>
            <SupplierComparisonTable rows={result.rows} />
          </div>

          <div className="grid-2">
            <SupplierEmissionChart rows={result.rows} />
            <SupplierCostCarbonChart rows={result.rows} />
          </div>

          <div className="card" style={{ marginTop: 20, background: 'var(--color-primary-light)', border: '1px solid var(--color-primary)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--color-primary)' }}>💡 Karar Özeti</h3>
            <p style={{ fontSize: 13, color: 'var(--color-primary-dark)' }}>
              <strong>Supplier B</strong> en düşük karbon emisyonuna sahip tedarikçidir (EF: 1.55 tCO₂e/ton).
              Mevcut tedarikçiye kıyasla <strong>561 tCO₂e azaltım</strong> sağlar.
              EPD belgesi mevcuttur. Ton başına maliyet {' '}
              <strong>60 ₺ daha yüksektir</strong>, ancak gelecekteki CBAM maliyeti hesaba katıldığında net avantaj sağlar.
            </p>
          </div>
        </>
      )}
    </PageContainer>
  )
}
