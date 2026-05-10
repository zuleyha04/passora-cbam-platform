import { useState } from 'react'
import PageContainer from '../components/layout/PageContainer'
import { COMPANY_ADMINS } from '../data/companyMockData'

const SECTORS = [
  'Demir-Çelik'
]

const SUB_SECTORS = [
  'Entegre Demir-Çelik',
  'Elektrik Ark Fırını',
  'Uzun Çelik Profil',
  'Yassı Çelik',
  'Boru/Profil',
  'Çelik İşleme',
]

const COMPANY_SIZES = ['Mikro', 'Küçük', 'Orta', 'Büyük']

const EXPORT_MARKETS = [
  'AB'
]

const STATUS_OPTIONS = ['Aktif', 'Pasif']

export default function CompanyAdmins() {
  const [admins, setAdmins] = useState(COMPANY_ADMINS)

  const [form, setForm] = useState({
    company: '',
    taxNumber: '',
    sector: 'Demir-Çelik',
    subSector: 'Elektrik Ark Fırını',
    country: 'Türkiye',
    city: '',
    companySize: 'Orta',
    exportMarket: 'AB',
    adminName: '',
    adminEmail: '',
    phone: '',
    status: 'Aktif',
  })

  function updateField(key, value) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    const newAdmin = {
      id: `ca-${Date.now()}`,
      company: form.company,
      taxNumber: form.taxNumber,
      sector: form.sector,
      subSector: form.subSector,
      country: form.country,
      city: form.city,
      companySize: form.companySize,
      exportMarket: form.exportMarket,
      name: form.adminName,
      email: form.adminEmail,
      phone: form.phone,
      role: 'KOBİ Firma Admini',
      status: form.status,
    }

    setAdmins((prev) => [...prev, newAdmin])

    setForm({
      company: '',
      taxNumber: '',
      sector: 'Demir-Çelik',
      subSector: 'Elektrik Ark Fırını',
      country: 'Türkiye',
      city: '',
      companySize: 'Orta',
      exportMarket: 'AB',
      adminName: '',
      adminEmail: '',
      phone: '',
      status: 'Aktif',
    })
  }

  return (
    <PageContainer
      title="Firma Admini Atama"
      subtitle="KOBİ firmaları için firma bilgisi oluşturma ve firma yöneticisi atama"
    >
      <div className="company-admin-assignment-layout">
        <div className="card">
          <h3 className="section-title">Yeni Firma ve Admin Ata</h3>

          <form onSubmit={handleSubmit} className="company-admin-form">
            <div className="form-section-title">Firma Bilgileri</div>

            <div className="form-group">
              <label>Firma Adı</label>
              <input
                value={form.company}
                onChange={(e) => updateField('company', e.target.value)}
                placeholder="Örn. Marmara Çelik Sanayi A.Ş."
                required
              />
            </div>

            <div className="form-group">
              <label>Vergi Numarası</label>
              <input
                value={form.taxNumber}
                onChange={(e) => updateField('taxNumber', e.target.value)}
                placeholder="Örn. 1234567890"
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Sektör</label>
                <select
                  value={form.sector}
                  onChange={(e) => updateField('sector', e.target.value)}
                >
                  {SECTORS.map((sector) => (
                    <option key={sector}>{sector}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Alt Sektör</label>
                <select
                  value={form.subSector}
                  onChange={(e) => updateField('subSector', e.target.value)}
                >
                  {SUB_SECTORS.map((subSector) => (
                    <option key={subSector}>{subSector}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Ülke</label>
                <input
                  value={form.country}
                  onChange={(e) => updateField('country', e.target.value)}
                  placeholder="Türkiye"
                />
              </div>

              <div className="form-group">
                <label>Şehir</label>
                <input
                  value={form.city}
                  onChange={(e) => updateField('city', e.target.value)}
                  placeholder="Örn. Kocaeli"
                  required
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Firma Ölçeği</label>
                <select
                  value={form.companySize}
                  onChange={(e) => updateField('companySize', e.target.value)}
                >
                  {COMPANY_SIZES.map((size) => (
                    <option key={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>İhracat Pazarı</label>
                <select
                  value={form.exportMarket}
                  onChange={(e) => updateField('exportMarket', e.target.value)}
                >
                  {EXPORT_MARKETS.map((market) => (
                    <option key={market}>{market}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-section-title">KOBİ Firma Admini</div>

            <div className="form-group">
              <label>Admin Adı Soyadı</label>
              <input
                value={form.adminName}
                onChange={(e) => updateField('adminName', e.target.value)}
                placeholder="Örn. Ayşe Yılmaz"
                required
              />
            </div>

            <div className="form-group">
              <label>Admin E-posta</label>
              <input
                type="email"
                value={form.adminEmail}
                onChange={(e) => updateField('adminEmail', e.target.value)}
                placeholder="admin@firma.com"
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label>Telefon</label>
                <input
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+90 555 000 00 00"
                />
              </div>

              <div className="form-group">
                <label>Durum</label>
                <select
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value)}
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary company-admin-submit">
              Firma Oluştur ve Admin Ata
            </button>
          </form>
        </div>

        <div className="card">
          <div className="company-admin-list-header">
            <div>
              <h3 className="section-title">Atanan Firma Adminleri</h3>
              <p>
                Oluşturulan firmalar ve atanmış KOBİ firma yöneticileri
              </p>
            </div>

            <span>{admins.length} kayıt</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Firma</th>
                  <th>Şehir</th>
                  <th>Sektör</th>
                  <th>Admin</th>
                  <th>E-posta</th>
                  <th>Durum</th>
                </tr>
              </thead>

              <tbody>
                {admins.map((admin) => (
                  <tr key={admin.id}>
                    <td>
                      <strong>{admin.company}</strong>
                      {admin.taxNumber && (
                        <small className="table-subtext">
                          VKN: {admin.taxNumber}
                        </small>
                      )}
                    </td>

                    <td>{admin.city || '-'}</td>

                    <td>
                      <span>{admin.sector || 'Demir-Çelik'}</span>
                      {admin.subSector && (
                        <small className="table-subtext">
                          {admin.subSector}
                        </small>
                      )}
                    </td>

                    <td>
                      <strong>{admin.name}</strong>
                      <small className="table-subtext">
                        {admin.role || 'KOBİ Firma Admini'}
                      </small>
                    </td>

                    <td>{admin.email}</td>

                    <td>
                      <span
                        className={
                          admin.status === 'Aktif'
                            ? 'badge badge-low'
                            : 'badge badge-medium'
                        }
                      >
                        {admin.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}