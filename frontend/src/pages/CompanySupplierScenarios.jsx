import { useMemo, useState } from 'react'
import PageContainer from '../components/layout/PageContainer'
import { COMPANY_SUPPLIER_SCENARIOS } from '../data/companyMockData'

function formatNumber(value) {
  return Number(value || 0).toLocaleString('tr-TR', {
    maximumFractionDigits: 0,
  })
}

function formatDecimal(value) {
  return Number(value || 0).toLocaleString('tr-TR', {
    maximumFractionDigits: 2,
  })
}

function getTotalEmission(supplier) {
  return Number(supplier.amount || 0) * Number(supplier.ef || 0)
}

function getTotalCost(supplier) {
  return Number(supplier.amount || 0) * Number(supplier.price || 0)
}

function getScenarioTone(diffEmission) {
  if (diffEmission < 0) return 'positive'
  if (diffEmission > 0) return 'negative'
  return 'neutral'
}

function getScenarioText(diffEmission, selectedSupplier) {
  if (diffEmission < 0) {
    return `${selectedSupplier.supplier} seçilirse karbon emisyonu ${formatNumber(
      Math.abs(diffEmission)
    )} tCO₂e azalır.`
  }

  if (diffEmission > 0) {
    return `${selectedSupplier.supplier} seçilirse karbon emisyonu ${formatNumber(
      diffEmission
    )} tCO₂e artar.`
  }

  return `${selectedSupplier.supplier} mevcut tedarikçiyle aynı karbon etkisine sahiptir.`
}

function getAiComment(diffEmission, diffCost, selectedSupplier) {
  if (diffEmission < 0 && diffCost <= 0) {
    return `${selectedSupplier.supplier} hem karbonu hem maliyeti düşürüyor. Bu seçenek öncelikli değerlendirilebilir.`
  }

  if (diffEmission < 0 && diffCost > 0) {
    return `${selectedSupplier.supplier} karbon emisyonunu azaltıyor ancak maliyeti artırıyor. CBAM riski yüksek ürünlerde mantıklı bir seçenek olabilir.`
  }

  if (diffEmission > 0 && diffCost < 0) {
    return `${selectedSupplier.supplier} maliyeti düşürüyor fakat karbon emisyonunu artırıyor. Sadece maliyet odaklı tercih edilirse CBAM riski oluşabilir.`
  }

  if (diffEmission > 0 && diffCost >= 0) {
    return `${selectedSupplier.supplier} hem karbon emisyonunu hem maliyeti artırıyor. Bu tedarikçi önerilmez.`
  }

  return 'Karbon etkisi mevcut tedarikçiye yakın. EPD belgesi ve veri kalitesi dikkate alınmalıdır.'
}

export default function CompanySupplierScenarios() {
  const suppliers = COMPANY_SUPPLIER_SCENARIOS

  const currentSupplier = suppliers[0]

  const sortedSuppliers = useMemo(() => {
    return [...suppliers].sort((a, b) => {
      return getTotalEmission(b) - getTotalEmission(a)
    })
  }, [suppliers])

  const currentIndex = sortedSuppliers.findIndex(
    (supplier) => supplier.id === currentSupplier.id
  )

  const [sliderIndex, setSliderIndex] = useState(
    currentIndex >= 0 ? currentIndex : 0
  )

  const selectedSupplier = sortedSuppliers[sliderIndex]

  const currentEmission = getTotalEmission(currentSupplier)
  const selectedEmission = getTotalEmission(selectedSupplier)

  const currentCost = getTotalCost(currentSupplier)
  const selectedCost = getTotalCost(selectedSupplier)

  const diffEmission = selectedEmission - currentEmission
  const diffCost = selectedCost - currentCost

  const emissionChangePercent =
    currentEmission > 0 ? (diffEmission / currentEmission) * 100 : 0

  const costChangePercent =
    currentCost > 0 ? (diffCost / currentCost) * 100 : 0

  const tone = getScenarioTone(diffEmission)

  const sliderPercent =
    sortedSuppliers.length > 1
      ? (sliderIndex / (sortedSuppliers.length - 1)) * 100
      : 0

  return (
    <PageContainer
      title="Tedarikçi Senaryoları"
      subtitle="Alternatif hammadde tedarikçilerinin karbon emisyonu ve maliyet simülasyonu"
    >
      <div className="supplier-slider-hero">
        <div>
          <span className="supplier-slider-badge">
            Tedarikçi Seçim Simülasyonu
          </span>

          <h2>Tedarikçiyi değiştir, karbon etkisini anında gör</h2>

          <p>
            Çubuğu sağa veya sola kaydırarak farklı tedarikçileri seçin. Sistem,
            seçilen tedarikçiye göre karbon emisyonunun ne kadar artacağını ya da
            azalacağını hesaplar.
          </p>
        </div>
      </div>

      <div className={`supplier-slider-panel ${tone}`}>
        <div className="supplier-slider-top">
          <div>
            <span className="slider-label">Seçilen Tedarikçi</span>
            <h3>{selectedSupplier.supplier}</h3>
            <p>
              {selectedSupplier.material} · {formatNumber(selectedSupplier.amount)} ton · EF{' '}
              {selectedSupplier.ef} tCO₂e/ton
            </p>
          </div>

          <div className={`slider-result-pill ${tone}`}>
            {diffEmission < 0 && 'Azalıyor'}
            {diffEmission > 0 && 'Artıyor'}
            {diffEmission === 0 && 'Referans'}
          </div>
        </div>

        <div className="supplier-emission-slider-area">
          <div className="slider-scale-labels">
            <span>Yüksek karbon</span>
            <span>Düşük karbon</span>
          </div>

          <div className="supplier-slider-track-wrap">
            <div className="supplier-slider-gradient" />

            <div
              className="supplier-slider-current-marker"
              style={{
                left: `${
                  sortedSuppliers.length > 1
                    ? (currentIndex / (sortedSuppliers.length - 1)) * 100
                    : 0
                }%`,
              }}
            >
              <span>Mevcut</span>
            </div>

            <div
              className={`supplier-slider-thumb-label ${tone}`}
              style={{ left: `${sliderPercent}%` }}
            >
              {selectedSupplier.supplier}
            </div>

            <input
              type="range"
              min="0"
              max={sortedSuppliers.length - 1}
              step="1"
              value={sliderIndex}
              onChange={(e) => setSliderIndex(Number(e.target.value))}
              className="supplier-range-input"
            />
          </div>

          <div className="supplier-slider-supplier-labels">
            {sortedSuppliers.map((supplier, index) => (
              <button
                key={supplier.id}
                type="button"
                className={
                  index === sliderIndex
                    ? 'supplier-slider-mini-label active'
                    : 'supplier-slider-mini-label'
                }
                onClick={() => setSliderIndex(index)}
              >
                {supplier.supplier}
              </button>
            ))}
          </div>
        </div>

        <div className="supplier-result-summary">
          <div className="supplier-result-main">
            <span>Karbon Farkı</span>

            <strong className={tone}>
              {diffEmission > 0 ? '+' : ''}
              {formatNumber(diffEmission)} tCO₂e
            </strong>

            <p>{getScenarioText(diffEmission, selectedSupplier)}</p>
          </div>

          <div className="supplier-result-metrics">
            <div>
              <span>Mevcut Emisyon</span>
              <strong>{formatNumber(currentEmission)} tCO₂e</strong>
            </div>

            <div>
              <span>Seçilen Emisyon</span>
              <strong>{formatNumber(selectedEmission)} tCO₂e</strong>
            </div>

            <div>
              <span>Emisyon Değişimi</span>
              <strong className={tone}>
                {emissionChangePercent > 0 ? '+' : ''}
                {formatDecimal(emissionChangePercent)}%
              </strong>
            </div>

            <div>
              <span>Maliyet Farkı</span>
              <strong>
                {diffCost > 0 ? '+' : ''}
                {formatNumber(diffCost)} ₺
              </strong>
            </div>
          </div>
        </div>
      </div>

      <div className={`supplier-slider-ai ${tone}`}>
        <span>AI Önerisi</span>
        <p>{getAiComment(diffEmission, diffCost, selectedSupplier)}</p>
      </div>

      <div className="card supplier-table-card">
        <div className="panel-header compact">
          <div>
            <h3 className="section-title">Tedarikçi Alternatifleri</h3>
            <p>
              Tüm tedarikçilerin karbon, maliyet ve EPD durumuna göre karşılaştırması
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Tedarikçi</th>
                <th>Hammadde</th>
                <th>Miktar</th>
                <th>EF</th>
                <th>Toplam Emisyon</th>
                <th>Ton Fiyatı</th>
                <th>Toplam Maliyet</th>
                <th>EPD</th>
                <th>Karbon Farkı</th>
                <th>Durum</th>
              </tr>
            </thead>

            <tbody>
              {suppliers.map((supplier) => {
                const totalEmission = getTotalEmission(supplier)
                const totalCost = getTotalCost(supplier)
                const carbonDiff = totalEmission - currentEmission
                const rowTone = getScenarioTone(carbonDiff)

                return (
                  <tr key={supplier.id}>
                    <td>
                      <strong>{supplier.supplier}</strong>
                    </td>

                    <td>{supplier.material}</td>

                    <td>{formatNumber(supplier.amount)} ton</td>

                    <td>{supplier.ef} tCO₂e/ton</td>

                    <td>
                      <strong>{formatNumber(totalEmission)} tCO₂e</strong>
                    </td>

                    <td>{supplier.price} ₺</td>

                    <td>{formatNumber(totalCost)} ₺</td>

                    <td>
                      <span
                        className={
                          supplier.epd ? 'badge badge-low' : 'badge badge-medium'
                        }
                      >
                        {supplier.epd ? 'Var' : 'Yok'}
                      </span>
                    </td>

                    <td>
                      <span className={`carbon-diff ${rowTone}`}>
                        {carbonDiff > 0 ? '+' : ''}
                        {formatNumber(carbonDiff)} tCO₂e
                      </span>
                    </td>

                    <td>
                      {carbonDiff < 0
                        ? 'Karbon azaltır'
                        : carbonDiff > 0
                          ? 'Karbon artırır'
                          : 'Mevcut tedarikçi'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageContainer>
  )
}