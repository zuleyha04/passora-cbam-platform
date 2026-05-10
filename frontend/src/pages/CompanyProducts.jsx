import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageContainer from '../components/layout/PageContainer'
import { COMPANY_PRODUCTS } from '../data/companyMockData'

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

function getRiskClass(risk) {
  const value = String(risk || '').toLowerCase()

  if (value.includes('kritik')) return 'badge badge-critical'
  if (value.includes('yüksek')) return 'badge badge-high'
  if (value.includes('orta')) return 'badge badge-medium'
  if (value.includes('düşük')) return 'badge badge-low'

  return 'badge badge-medium'
}

function getStatusClass(status) {
  const value = String(status || '').toLowerCase()

  if (value.includes('onay')) return 'company-status-warning'
  if (value.includes('eksik')) return 'company-status-danger'
  if (value.includes('tamam')) return 'company-status-success'
  if (value.includes('revizyon')) return 'company-status-danger'

  return 'company-status-neutral'
}

function getDqColor(value) {
  const score = Number(value || 0)

  if (score >= 80) return '#16A34A'
  if (score >= 65) return '#D97706'
  return '#DC2626'
}

function getPrimaryAction(status) {
  const value = String(status || '').toLowerCase()

  if (value.includes('eksik')) return 'Veri Tamamla'
  if (value.includes('onay')) return 'Detay Gör'
  if (value.includes('revizyon')) return 'Revizyonu Aç'
  if (value.includes('tamam')) return 'Raporu Gör'

  return 'Hesaplama Yap'
}

function ProductKpi({ label, value, sub, tone }) {
  return (
    <div className={`product-kpi-card ${tone || ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {sub && <small>{sub}</small>}
    </div>
  )
}

function DataQualityBar({ value }) {
  return (
    <div className="dq-cell">
      <div className="dq-track">
        <div
          className="dq-fill"
          style={{
            width: `${value}%`,
            background: getDqColor(value),
          }}
        />
      </div>
      <strong>{value}</strong>
    </div>
  )
}

export default function CompanyProducts() {
  const navigate = useNavigate()

  const [products, setProducts] = useState(COMPANY_PRODUCTS)
  const [showForm, setShowForm] = useState(false)

  const [form, setForm] = useState({
    name: '',
    cnCode: '',
    productType: 'Çelik Profil',
    productionMethod: 'Elektrik Ark Fırını / EAF',
    productionAmount: '',
  })

  const stats = useMemo(() => {
    return {
      total: products.length,
      approval: products.filter((p) =>
        String(p.status).toLowerCase().includes('onay')
      ).length,
      missing: products.filter((p) =>
        String(p.status).toLowerCase().includes('eksik')
      ).length,
      critical: products.filter((p) => p.risk === 'Kritik').length,
    }
  }, [products])

  function updateField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  function handleAddProduct(e) {
    e.preventDefault()

    const newProduct = {
      id: `p-${Date.now()}`,
      name: form.name,
      cnCode: form.cnCode,
      productType: form.productType,
      productionMethod: form.productionMethod,
      productionAmount: Number(form.productionAmount || 0),
      totalEmission: 0,
      specificEmission: 0,
      dataQuality: 0,
      risk: 'Orta',
      status: 'Hesaplama Yok',
    }

    setProducts((prev) => [...prev, newProduct])

    setForm({
      name: '',
      cnCode: '',
      productType: 'Çelik Profil',
      productionMethod: 'Elektrik Ark Fırını / EAF',
      productionAmount: '',
    })

    setShowForm(false)
  }

  function goToCalculation(product) {
    navigate(
      `/company/cbam-calculation?product=${encodeURIComponent(product.name)}&cn=${encodeURIComponent(product.cnCode)}`
    )
  }

  return (
    <PageContainer
      title="Ürünlerim"
      subtitle="Firmanızın CBAM kapsamındaki ürünleri ve emisyon hesaplama durumu"
    >
      <div className="products-hero">
        <div>
          <span className="products-hero-badge">KOBİ Firma Admini</span>
          <h2>CBAM Ürün Portföyü</h2>
          <p>
            Ürünlerinizi takip edin, eksik verileri tamamlayın ve ürün bazlı
            emisyon hesaplamalarını başlatın.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowForm((prev) => !prev)}
        >
          + Yeni Ürün Ekle
        </button>
      </div>

      <div className="products-kpi-grid">
        <ProductKpi
          label="Toplam Ürün"
          value={stats.total}
          sub="CBAM kapsamındaki ürün"
          tone="green"
        />

        <ProductKpi
          label="Onay Bekleyen"
          value={stats.approval}
          sub="Yönetici kontrolü gerekli"
          tone="yellow"
        />

        <ProductKpi
          label="Eksik Veri"
          value={stats.missing}
          sub="Veri tamamlanmalı"
          tone="orange"
        />

        <ProductKpi
          label="Kritik Risk"
          value={stats.critical}
          sub="Öncelikli inceleme"
          tone="red"
        />
      </div>

      {showForm && (
        <div className="card product-form-card">
          <div className="panel-header compact">
            <div>
              <h3 className="section-title">Yeni Ürün Ekle</h3>
              <p>
                CBAM hesaplaması yapılacak ürünün temel bilgilerini girin.
              </p>
            </div>
          </div>

          <form onSubmit={handleAddProduct} className="product-form-grid">
            <div className="form-group">
              <label>Ürün Adı</label>
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Örn. Sıcak Haddelenmiş Rulo"
                required
              />
            </div>

            <div className="form-group">
              <label>CN Kodu</label>
              <input
                value={form.cnCode}
                onChange={(e) => updateField('cnCode', e.target.value)}
                placeholder="Örn. 7208"
                required
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

            <div className="form-group">
              <label>Üretim Miktarı ton</label>
              <input
                type="number"
                value={form.productionAmount}
                onChange={(e) =>
                  updateField('productionAmount', e.target.value)
                }
                placeholder="Örn. 1000"
                required
              />
            </div>

            <div className="product-form-actions">
              <button type="submit" className="btn btn-primary">
                Ürünü Kaydet
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowForm(false)}
              >
                Vazgeç
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card product-table-card">
        <div className="panel-header compact">
          <div>
            <h3 className="section-title">Ürün Portföyü</h3>
            <p>
              Her ürün için hesaplama durumu, veri kalitesi ve risk seviyesi
              takip edilir.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="company-product-table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>CN Kodu</th>
                <th>Ürün Tipi</th>
                <th>Üretim Miktarı</th>
                <th>Toplam Emisyon</th>
                <th>Spesifik Emisyon</th>
                <th>DQ</th>
                <th>Risk</th>
                <th>Durum</th>
                <th>Aksiyon</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                  </td>

                  <td>{product.cnCode}</td>

                  <td>{product.productType || product.name}</td>

                  <td>{product.productionAmount} ton</td>

                  <td>
                    <strong>
                      {product.totalEmission.toLocaleString('tr-TR')} tCO₂e
                    </strong>
                  </td>

                  <td>{product.specificEmission} tCO₂e/ton</td>

                  <td>
                    <DataQualityBar value={product.dataQuality} />
                  </td>

                  <td>
                    <span className={getRiskClass(product.risk)}>
                      {product.risk}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`company-status-pill-2 ${getStatusClass(
                        product.status
                      )}`}
                    >
                      {product.status}
                    </span>
                  </td>

                  <td>
                    <div className="product-actions">
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => goToCalculation(product)}
                      >
                        {getPrimaryAction(product.status)}
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                      >
                        Detay
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="product-note-card">
        <strong>CBAM Notu</strong>
        <p>
          CN kodu, ürün tipi ve üretim miktarı girilmeden sağlıklı emisyon
          hesabı yapılamaz. Eksik veri bırakılırsa sistem varsayılan emisyon
          faktörü kullanabilir ve bu durum veri kalite skorunu düşürebilir.
        </p>
      </div>
    </PageContainer>
  )
}