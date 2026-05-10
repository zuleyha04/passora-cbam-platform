import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PageContainer from '../components/layout/PageContainer'

const DEFAULT_FACTORS = {
  electricityMwh: 0.42,
  naturalGasSm3: 0.00202,
  supplierEf: 2.1,
  logisticsKgPerTonKm: 0.09,
}

const DEFAULT_FORM_VALUES = {
  productionAmount: '1000',
  electricity: '550',
  naturalGas: '15000',
  supplierEf: '2.1',
  distance: '500',
}

const PRODUCT_TYPES = [
  'Çelik Profil',
  'İnşaat Demiri',
  'Tel Çubuk',
  'Sıcak Haddelenmiş Rulo',
  'Soğuk Haddelenmiş Rulo',
  'Boru/Profil',
  'Yapısal Çelik',
]

const PRODUCTION_METHODS = [
  'Entegre tesis / BF-BOF',
  'Elektrik Ark Fırını / EAF',
  'Haddeleme',
  'Karma üretim',
]

const MATERIAL_TYPES = [
  'Hurda',
  'Demir cevheri',
  'DRI/HBI',
  'Slab',
  'Billet',
  'Pig iron',
  'Ferroalyaj',
  'Kireç',
  'Kok',
]

const TRANSPORT_MODES = [
  'Karayolu',
  'Demiryolu',
  'Deniz yolu',
  'Karma taşıma',
]

function toNumber(value) {
  if (value === '' || value === null || value === undefined) return null

  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function formatNumber(value, digits = 2) {
  return Number(value || 0).toLocaleString('tr-TR', {
    maximumFractionDigits: digits,
  })
}

function getRiskLevel(specificEmission) {
  if (specificEmission >= 3.5) return 'Kritik'
  if (specificEmission >= 2.8) return 'Yüksek'
  if (specificEmission >= 2.2) return 'Orta'
  return 'Düşük'
}

function getRiskClass(risk) {
  if (risk === 'Kritik') return 'badge badge-critical'
  if (risk === 'Yüksek') return 'badge badge-high'
  if (risk === 'Orta') return 'badge badge-medium'
  return 'badge badge-low'
}

function getCriticalFields() {
  return [
    { key: 'productionAmount', label: 'Üretim miktarı' },
    { key: 'electricity', label: 'Elektrik tüketimi' },
    { key: 'naturalGas', label: 'Doğal gaz tüketimi' },
    { key: 'materialAmount', label: 'Hammadde miktarı' },
    { key: 'supplierEf', label: 'Tedarikçi emisyon faktörü' },
    { key: 'distance', label: 'Nakliye mesafesi' },
  ]
}

function getMissingFields(form) {
  return getCriticalFields().filter((field) => {
    const value = form[field.key]
    return value === '' || value === null || value === undefined
  })
}

function fillFormWithDefaults(form) {
  const filledForm = { ...form }

  if (!filledForm.productionAmount) {
    filledForm.productionAmount = DEFAULT_FORM_VALUES.productionAmount
  }

  if (!filledForm.electricity) {
    filledForm.electricity = DEFAULT_FORM_VALUES.electricity
  }

  if (!filledForm.naturalGas) {
    filledForm.naturalGas = DEFAULT_FORM_VALUES.naturalGas
  }

  if (!filledForm.materialAmount) {
    filledForm.materialAmount =
      filledForm.productionAmount || DEFAULT_FORM_VALUES.productionAmount
  }

  if (!filledForm.supplierEf) {
    filledForm.supplierEf = DEFAULT_FORM_VALUES.supplierEf
  }

  if (!filledForm.distance) {
    filledForm.distance = DEFAULT_FORM_VALUES.distance
  }

  return filledForm
}

function calculateResult(form) {
  const criticalFields = getCriticalFields()
  const missingFields = getMissingFields(form)
  const usedDefaults = missingFields.map((field) => field.label)

  const productionAmount = toNumber(form.productionAmount)
  const electricity = toNumber(form.electricity)
  const naturalGas = toNumber(form.naturalGas)
  const materialAmount = toNumber(form.materialAmount)
  const supplierEf = toNumber(form.supplierEf)
  const distance = toNumber(form.distance)

  const safeProductionAmount = productionAmount ?? Number(DEFAULT_FORM_VALUES.productionAmount)
  const safeElectricity = electricity ?? Number(DEFAULT_FORM_VALUES.electricity)
  const safeNaturalGas = naturalGas ?? Number(DEFAULT_FORM_VALUES.naturalGas)
  const safeMaterialAmount = materialAmount ?? safeProductionAmount
  const safeSupplierEf = supplierEf ?? DEFAULT_FACTORS.supplierEf
  const safeDistance = distance ?? Number(DEFAULT_FORM_VALUES.distance)

  const renewableRate = toNumber(form.renewableRate) ?? 0
  const electricityFactor =
    DEFAULT_FACTORS.electricityMwh * (1 - renewableRate / 100)

  const electricityEmission = safeElectricity * electricityFactor
  const gasEmission = safeNaturalGas * DEFAULT_FACTORS.naturalGasSm3
  const materialEmission = safeMaterialAmount * safeSupplierEf
  const logisticsEmission =
    (safeDistance *
      safeMaterialAmount *
      DEFAULT_FACTORS.logisticsKgPerTonKm) /
    1000

  const totalEmission =
    electricityEmission + gasEmission + materialEmission + logisticsEmission

  const specificEmission =
    safeProductionAmount > 0 ? totalEmission / safeProductionAmount : 0

  const missingRatio = Math.round(
    (missingFields.length / criticalFields.length) * 100
  )

  const dataQuality = Math.max(35, 100 - missingFields.length * 10)

  let calculationMode = 'Actual Data'

  if (missingFields.length > 0 && missingFields.length < criticalFields.length) {
    calculationMode = 'Hybrid'
  }

  if (missingFields.length >= criticalFields.length / 2) {
    calculationMode = 'Default'
  }

  const risk = getRiskLevel(specificEmission)

  return {
    totalEmission,
    specificEmission,
    electricityEmission,
    gasEmission,
    materialEmission,
    logisticsEmission,
    missingFields,
    usedDefaults,
    missingRatio,
    dataQuality,
    calculationMode,
    risk,
  }
}

export default function CbamCalculation() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const initialProduct = searchParams.get('product') || 'Çelik Profil'
  const initialCn = searchParams.get('cn') || '7216'

  const [form, setForm] = useState({
    productName: initialProduct,
    cnCode: initialCn,
    productType: initialProduct,
    period: '2026 Q2',
    productionAmount: '1000',

    productionMethod: 'Elektrik Ark Fırını / EAF',
    scrapRate: '45',

    electricity: '450',
    naturalGas: '12000',
    renewableRate: '0',

    materialType: 'Billet',
    materialAmount: '1020',
    supplierName: 'Supplier A',
    supplierCountry: 'Türkiye',
    supplierEf: '1.85',
    epdStatus: 'Var',

    transportMode: 'Karayolu',
    distance: '420',
  })

  const result = useMemo(() => calculateResult(form), [form])
  const hasMissingData = result.missingFields.length > 0

  function updateField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  function handleSendApproval() {
    const finalForm = fillFormWithDefaults(form)
    const finalResult = calculateResult(finalForm)

    setForm(finalForm)

    const approvalItem = {
      id: `approval-${Date.now()}`,
      product: finalForm.productName,
      cnCode: finalForm.cnCode,
      period: finalForm.period,
      totalEmission: Number(finalResult.totalEmission.toFixed(2)),
      specificEmission: Number(finalResult.specificEmission.toFixed(2)),
      dataQuality: finalResult.dataQuality,
      calculationMode: finalResult.calculationMode,
      risk: finalResult.risk,
      missingRatio: finalResult.missingRatio,
      defaultsUsed: finalResult.usedDefaults,
      createdAt: new Date().toISOString(),
      status: 'Onay Bekliyor',
    }

    const previousApprovals = JSON.parse(
      localStorage.getItem('passora_pending_approvals') || '[]'
    )

    localStorage.setItem(
      'passora_pending_approvals',
      JSON.stringify([approvalItem, ...previousApprovals])
    )

    navigate('/company/approvals?from=cbam&added=1')
  }

  return (
    <PageContainer
      title="CBAM Hesaplama"
      subtitle="Demir-çelik ürünü için üretim, enerji, hammadde ve lojistik verilerini girin"
    >
      <div className="cbam-professional-hero">
        <div>
          <span>Ürün Bazlı Hesaplama</span>
          <h2>CBAM karbon emisyon hesabı</h2>
          <p>
            Kritik alanlar boş bırakılırsa sistem varsayılan emisyon faktörleri
            kullanır. Bu durum emisyon sonucunu yükseltebilir ve veri kalite
            skorunu düşürür.
          </p>
        </div>

        <div className={`cbam-mode-card ${hasMissingData ? 'warning' : 'success'}`}>
          <small>Hesaplama Modu</small>
          <strong>{result.calculationMode}</strong>
          <p>
            {hasMissingData
              ? `${result.missingFields.length} kritik veri eksik`
              : 'Tüm kritik veriler girildi'}
          </p>
        </div>
      </div>

      {hasMissingData && (
        <div className="cbam-default-warning">
          <strong>⚠ Eksik veri uyarısı</strong>
          <p>
            {result.usedDefaults.join(', ')} alanı boş bırakıldı. Bu alanlarda
            varsayılan emisyon faktörü kullanılacak. Varsayılan değerler karbon
            emisyonunu olduğundan yüksek gösterebilir ve veri kalite skorunu
            düşürür. Onaya gönderildiğinde bu alanlar otomatik default değerle
            doldurulur.
          </p>
        </div>
      )}

      <div className="cbam-layout-pro">
        <div className="cbam-form-stack">
          <div className="cbam-section-card">
            <div className="cbam-section-header">
              <span>1</span>
              <div>
                <h3>Ürün Bilgileri</h3>
                <p>CBAM kapsamında hesaplanacak ürünün temel bilgileri</p>
              </div>
            </div>

            <div className="cbam-form-grid">
              <div className="form-group">
                <label>Ürün Adı</label>
                <input
                  value={form.productName}
                  onChange={(e) => updateField('productName', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>CN Kodu</label>
                <input
                  value={form.cnCode}
                  onChange={(e) => updateField('cnCode', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Ürün Tipi</label>
                <select
                  value={form.productType}
                  onChange={(e) => updateField('productType', e.target.value)}
                >
                  {PRODUCT_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Üretim Dönemi</label>
                <input
                  value={form.period}
                  onChange={(e) => updateField('period', e.target.value)}
                />
              </div>

              <div className="form-group required-field">
                <label>Üretim Miktarı ton</label>
                <input
                  type="number"
                  value={form.productionAmount}
                  onChange={(e) =>
                    updateField('productionAmount', e.target.value)
                  }
                  placeholder="Boşsa default kullanılır"
                />
              </div>
            </div>
          </div>

          <div className="cbam-section-card">
            <div className="cbam-section-header">
              <span>2</span>
              <div>
                <h3>Üretim ve Enerji Verileri</h3>
                <p>Üretim yöntemi, elektrik, yakıt ve hurda oranı</p>
              </div>
            </div>

            <div className="cbam-form-grid">
              <div className="form-group">
                <label>Üretim Yöntemi</label>
                <select
                  value={form.productionMethod}
                  onChange={(e) =>
                    updateField('productionMethod', e.target.value)
                  }
                >
                  {PRODUCTION_METHODS.map((method) => (
                    <option key={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div className="form-group required-field">
                <label>Elektrik Tüketimi MWh</label>
                <input
                  type="number"
                  value={form.electricity}
                  onChange={(e) => updateField('electricity', e.target.value)}
                  placeholder="Boşsa default kullanılır"
                />
              </div>

              <div className="form-group required-field">
                <label>Doğal Gaz Sm³</label>
                <input
                  type="number"
                  value={form.naturalGas}
                  onChange={(e) => updateField('naturalGas', e.target.value)}
                  placeholder="Boşsa default kullanılır"
                />
              </div>

              <div className="form-group">
                <label>Hurda Kullanım Oranı %</label>
                <input
                  type="number"
                  value={form.scrapRate}
                  onChange={(e) => updateField('scrapRate', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Yenilenebilir Elektrik Oranı %</label>
                <input
                  type="number"
                  value={form.renewableRate}
                  onChange={(e) => updateField('renewableRate', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="cbam-section-card">
            <div className="cbam-section-header">
              <span>3</span>
              <div>
                <h3>Hammadde ve Tedarikçi Verileri</h3>
                <p>Hammadde miktarı, tedarikçi ve EPD bilgisi</p>
              </div>
            </div>

            <div className="cbam-form-grid">
              <div className="form-group">
                <label>Hammadde Türü</label>
                <select
                  value={form.materialType}
                  onChange={(e) => updateField('materialType', e.target.value)}
                >
                  {MATERIAL_TYPES.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group required-field">
                <label>Hammadde Miktarı ton</label>
                <input
                  type="number"
                  value={form.materialAmount}
                  onChange={(e) =>
                    updateField('materialAmount', e.target.value)
                  }
                  placeholder="Boşsa default kullanılır"
                />
              </div>

              <div className="form-group">
                <label>Tedarikçi Adı</label>
                <input
                  value={form.supplierName}
                  onChange={(e) => updateField('supplierName', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Tedarikçi Ülkesi</label>
                <input
                  value={form.supplierCountry}
                  onChange={(e) =>
                    updateField('supplierCountry', e.target.value)
                  }
                />
              </div>

              <div className="form-group required-field">
                <label>Tedarikçi EF tCO₂e/ton</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.supplierEf}
                  onChange={(e) => updateField('supplierEf', e.target.value)}
                  placeholder="Boşsa default kullanılır"
                />
              </div>

              <div className="form-group">
                <label>EPD Durumu</label>
                <select
                  value={form.epdStatus}
                  onChange={(e) => updateField('epdStatus', e.target.value)}
                >
                  <option>Var</option>
                  <option>Yok</option>
                  <option>Bilinmiyor</option>
                </select>
              </div>
            </div>
          </div>

          <div className="cbam-section-card">
            <div className="cbam-section-header">
              <span>4</span>
              <div>
                <h3>Lojistik Verileri</h3>
                <p>Taşıma modu ve nakliye mesafesi</p>
              </div>
            </div>

            <div className="cbam-form-grid">
              <div className="form-group">
                <label>Taşıma Modu</label>
                <select
                  value={form.transportMode}
                  onChange={(e) => updateField('transportMode', e.target.value)}
                >
                  {TRANSPORT_MODES.map((mode) => (
                    <option key={mode}>{mode}</option>
                  ))}
                </select>
              </div>

              <div className="form-group required-field">
                <label>Mesafe km</label>
                <input
                  type="number"
                  value={form.distance}
                  onChange={(e) => updateField('distance', e.target.value)}
                  placeholder="Boşsa default kullanılır"
                />
              </div>
            </div>
          </div>
        </div>

        <aside className="cbam-result-panel">
          <div className="cbam-result-header">
            <span>Hesaplama Sonucu</span>
            <strong>{formatNumber(result.totalEmission, 2)} tCO₂e</strong>
            <p>Toplam emisyon</p>
          </div>

          <div className="cbam-result-metric">
            <span>Spesifik Emisyon</span>
            <strong>{formatNumber(result.specificEmission, 2)} tCO₂e/ton</strong>
          </div>

          <div className="cbam-result-metric">
            <span>Veri Kalitesi</span>
            <strong>{result.dataQuality} / 100</strong>
          </div>

          <div className="cbam-result-metric">
            <span>Eksik Veri Oranı</span>
            <strong>{result.missingRatio}%</strong>
          </div>

          <div className="cbam-result-metric">
            <span>Hesaplama Modu</span>
            <strong>{result.calculationMode}</strong>
          </div>

          <div className="cbam-result-metric">
            <span>Risk Seviyesi</span>
            <span className={getRiskClass(result.risk)}>{result.risk}</span>
          </div>

          <div className="cbam-breakdown">
            <h4>Emisyon Kırılımı</h4>

            <div>
              <span>Elektrik</span>
              <strong>{formatNumber(result.electricityEmission, 2)}</strong>
            </div>

            <div>
              <span>Doğal gaz</span>
              <strong>{formatNumber(result.gasEmission, 2)}</strong>
            </div>

            <div>
              <span>Hammadde</span>
              <strong>{formatNumber(result.materialEmission, 2)}</strong>
            </div>

            <div>
              <span>Lojistik</span>
              <strong>{formatNumber(result.logisticsEmission, 2)}</strong>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary cbam-submit-btn"
            onClick={handleSendApproval}
          >
            Onaya Gönder
          </button>
        </aside>
      </div>
    </PageContainer>
  )
}