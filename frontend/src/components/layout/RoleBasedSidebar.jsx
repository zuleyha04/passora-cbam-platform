import { NavLink, useNavigate } from 'react-router-dom'

const MENU = {
  super_admin: [
    { label: 'Dashboard', path: '/admin', icon: '▦' },
    { label: 'Firmalar', path: '/admin/companies', icon: '▣' },
    { label: 'Firma Admini Atama', path: '/admin/company-admins', icon: '👤' },
    { label: 'Raporlar', path: '/admin/reports', icon: '▤' },
    { label: 'Ayarlar', path: '/admin/settings', icon: '⚙' },
  ],
  company_admin: [
  { label: 'Firma Dashboard', path: '/company', icon: '▦' },
  { label: 'Ürünlerim', path: '/company/products', icon: '▣' },
  { label: 'CBAM Hesaplama', path: '/company/cbam-calculation', icon: '🧮' },
  { label: 'Onay Bekleyenler', path: '/company/approvals', icon: '☑' },
  { label: 'Tedarikçi Senaryoları', path: '/company/supplier-scenarios', icon: '↔' },
  { label: 'Kullanıcılar', path: '/company/users', icon: '👥' },
  { label: 'Ayarlar', path: '/company/settings', icon: '⚙' },
],
  operator: [
    { label: 'Görevlerim', path: '/operator', icon: '✓' },
    { label: 'Veri Girişi', path: '/operator/data-entry', icon: '✎' },
    { label: 'Belgeler', path: '/operator/documents', icon: '▤' },
  ],
}

function getCurrentRole() {
  return localStorage.getItem('passora_role') || 'super_admin'
}

export default function RoleBasedSidebar() {
  const navigate = useNavigate()
  const role = getCurrentRole()
  const menu = MENU[role] || MENU.super_admin

  function changeRole(nextRole) {
    localStorage.setItem('passora_role', nextRole)

    if (nextRole === 'super_admin') navigate('/admin')
    if (nextRole === 'company_admin') navigate('/company')
    if (nextRole === 'operator') navigate('/operator')

    window.location.reload()
  }

  return (
    <aside className="role-sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">↗</div>
        <div>
          <strong>Passora</strong>
          <span>CBAM & Carbon Intelligence</span>
        </div>
      </div>

      <div className="role-switcher">
        <label>Demo Rol</label>
        <select value={role} onChange={(e) => changeRole(e.target.value)}>
          <option value="super_admin">Passora Super Admin</option>
          <option value="company_admin">KOBİ Firma Admini</option>
          <option value="operator">Operasyon Kullanıcısı</option>
        </select>
      </div>

      <nav className="role-menu">
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? 'role-menu-item active' : 'role-menu-item'
            }
          >
            <span>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <strong>
          {role === 'super_admin'
            ? 'Passora Admin'
            : role === 'company_admin'
              ? 'Firma Admini'
              : 'Operasyon Kullanıcısı'}
        </strong>
        <span>demo@passora.com</span>
      </div>
    </aside>
  )
}