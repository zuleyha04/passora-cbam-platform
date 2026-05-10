import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import {
  LayoutDashboard, Building2, FileText, GitCompare,
  AlertCircle, Settings, LogOut, Leaf, BarChart3
} from 'lucide-react'

const adminMenu = [
  { to: '/admin',              label: 'Admin Dashboard', icon: LayoutDashboard },
  { to: '/admin/companies',    label: 'Companies',       icon: Building2 },
  { to: '/admin/reports',      label: 'Reports',         icon: FileText },
  { to: '/admin/scenarios',    label: 'Supplier Scenarios', icon: GitCompare },
  { to: '/admin/settings',     label: 'Settings',        icon: Settings },
]

const userMenu = [
  { to: '/dashboard',   label: 'Dashboard',              icon: LayoutDashboard },
  { to: '/calculate',   label: 'Veri Girişi',            icon: BarChart3 },
  { to: '/suppliers',   label: 'Tedarikçi Karşılaştırması', icon: GitCompare },
  { to: '/missing',     label: 'Eksik Veri Analizi',     icon: AlertCircle },
  { to: '/reports',     label: 'Raporlar',               icon: FileText },
  { to: '/settings',    label: 'Ayarlar',                icon: Settings },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const menu = user?.role === 'admin' ? adminMenu : userMenu

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <aside style={{
      width: 240,
      minHeight: '100vh',
      background: '#0D1B2A',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #0D7A5F, #16A34A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Leaf size={18} color="#fff" />
          </div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '-0.3px' }}>Passora</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11, lineHeight: 1.4 }}>
          CBAM Readiness &<br />Carbon Intelligence Platform
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {menu.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin' || to === '/dashboard'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 12px',
              borderRadius: 7,
              marginBottom: 2,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
              background: isActive ? 'rgba(13,122,95,0.35)' : 'transparent',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              transition: 'all 0.15s',
            })}
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '12px 10px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ padding: '10px 12px', marginBottom: 4 }}>
          <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{user?.name}</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>{user?.role === 'admin' ? 'Admin' : 'Carbon Officer'}</p>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: '100%', padding: '9px 12px', borderRadius: 7,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)', fontSize: 13,
          }}
        >
          <LogOut size={15} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
