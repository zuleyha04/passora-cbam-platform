import { useState } from 'react'
import PageContainer from '../components/layout/PageContainer'
import { COMPANY_PRODUCTS, COMPANY_USERS } from '../data/companyMockData'

const DEPARTMENTS = [
  'Üretim',
  'Enerji',
  'Satın Alma',
  'Lojistik',
  'Kalite / Sürdürülebilirlik',
]

const ROLES = [
  'Üretim Sorumlusu',
  'Enerji Sorumlusu',
  'Tedarikçi / Hammadde Sorumlusu',
  'Lojistik Sorumlusu',
  'Kalite / Sürdürülebilirlik Sorumlusu',
]

const DATA_SCOPES = [
  'Üretim Verisi',
  'Elektrik ve Yakıt Verisi',
  'Hammadde ve EPD Verisi',
  'Nakliye Verisi',
  'Belge / Kanıt Yükleme',
]

const STATUS_OPTIONS = ['Aktif', 'Pasif']

function getDepartmentBadgeClass(department) {
  const value = String(department || '').toLowerCase()

  if (value.includes('üretim')) return 'user-dept production'
  if (value.includes('enerji')) return 'user-dept energy'
  if (value.includes('satın')) return 'user-dept purchase'
  if (value.includes('lojistik')) return 'user-dept logistics'

  return 'user-dept quality'
}

export default function CompanyUsers() {
  const [users, setUsers] = useState(COMPANY_USERS)

  const [form, setForm] = useState({
    name: '',
    email: '',
    department: 'Üretim',
    role: 'Üretim Sorumlusu',
    dataScope: 'Üretim Verisi',
    assignedProduct: COMPANY_PRODUCTS[0]?.name || '',
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

    const newUser = {
      id: `u-${Date.now()}`,
      ...form,
    }

    setUsers((prev) => [...prev, newUser])

    setForm({
      name: '',
      email: '',
      department: 'Üretim',
      role: 'Üretim Sorumlusu',
      dataScope: 'Üretim Verisi',
      assignedProduct: COMPANY_PRODUCTS[0]?.name || '',
      status: 'Aktif',
    })
  }

  const activeUsers = users.filter((user) => user.status === 'Aktif').length
  const passiveUsers = users.filter((user) => user.status === 'Pasif').length
  const uniqueDepartments = new Set(users.map((user) => user.department)).size

  return (
    <PageContainer
      title="Kullanıcılar"
      subtitle="Firma içi operasyon kullanıcıları ve veri giriş sorumlulukları"
    >
      <div className="company-users-hero">
        <div>
          <span className="company-users-badge">Operasyon Ekibi Yönetimi</span>
          <h2>Karbon emisyonu verilerini kim girecek?</h2>
          <p>
            Üretim, enerji, satın alma ve lojistik ekiplerinden kullanıcılar
            tanımlanır. Her kullanıcı sadece kendisine atanan veri alanını girer.
          </p>
        </div>
      </div>

      <div className="company-users-kpi-grid">
        <div className="company-user-kpi">
          <span>Toplam Kullanıcı</span>
          <strong>{users.length}</strong>
          <small>Firma içi operasyon kullanıcısı</small>
        </div>

        <div className="company-user-kpi">
          <span>Aktif Kullanıcı</span>
          <strong>{activeUsers}</strong>
          <small>Veri girişi yapabilir</small>
        </div>

        <div className="company-user-kpi">
          <span>Pasif Kullanıcı</span>
          <strong>{passiveUsers}</strong>
          <small>Geçici olarak devre dışı</small>
        </div>

        <div className="company-user-kpi">
          <span>Departman</span>
          <strong>{uniqueDepartments}</strong>
          <small>Veri sorumluluğu dağıtılmış</small>
        </div>
      </div>

      <div className="company-users-layout">
        <div className="card">
          <h3 className="section-title">Yeni Operasyon Kullanıcısı Ata</h3>

          <form onSubmit={handleSubmit} className="company-user-form">
            <div className="form-group">
              <label>Ad Soyad</label>
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Örn. Ahmet Yıldız"
                required
              />
            </div>

            <div className="form-group">
              <label>E-posta</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="kullanici@firma.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Departman</label>
              <select
                value={form.department}
                onChange={(e) => updateField('department', e.target.value)}
              >
                {DEPARTMENTS.map((department) => (
                  <option key={department}>{department}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Rol</label>
              <select
                value={form.role}
                onChange={(e) => updateField('role', e.target.value)}
              >
                {ROLES.map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Veri Sorumluluğu</label>
              <select
                value={form.dataScope}
                onChange={(e) => updateField('dataScope', e.target.value)}
              >
                {DATA_SCOPES.map((scope) => (
                  <option key={scope}>{scope}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Atanacak Ürün</label>
              <select
                value={form.assignedProduct}
                onChange={(e) => updateField('assignedProduct', e.target.value)}
              >
                {COMPANY_PRODUCTS.map((product) => (
                  <option key={product.id}>{product.name}</option>
                ))}
              </select>
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

            <button type="submit" className="btn btn-primary company-user-submit">
              Kullanıcı Ata
            </button>
          </form>
        </div>

        <div className="card company-users-table-card">
          <div className="panel-header compact">
            <div>
              <h3 className="section-title">Operasyon Kullanıcıları</h3>
              <p>
                CBAM hesabı için üretim, enerji, hammadde ve lojistik verisi
                girecek kişiler
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Kullanıcı</th>
                  <th>Departman</th>
                  <th>Rol</th>
                  <th>Veri Sorumluluğu</th>
                  <th>Ürün</th>
                  <th>Durum</th>
                  <th>Aksiyon</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong>
                      <small className="table-subtext">{user.email}</small>
                    </td>

                    <td>
                      <span className={getDepartmentBadgeClass(user.department)}>
                        {user.department}
                      </span>
                    </td>

                    <td>{user.role}</td>

                    <td>{user.dataScope}</td>

                    <td>
                      <strong>{user.assignedProduct}</strong>
                    </td>

                    <td>
                      <span
                        className={
                          user.status === 'Aktif'
                            ? 'badge badge-low'
                            : 'badge badge-medium'
                        }
                      >
                        {user.status}
                      </span>
                    </td>

                    <td>
                      <button className="btn btn-outline btn-sm">
                        Görev Gör
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="company-user-note">
        <strong>Not</strong>
        <p>
          Bu kullanıcılar tam raporları görmez. Sadece kendilerine atanmış
          üretim, enerji, hammadde, lojistik veya belge yükleme verilerini
          girerler. Son kontrol ve onay KOBİ Firma Admini tarafından yapılır.
        </p>
      </div>
    </PageContainer>
  )
}