import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import {
  LayoutDashboard, Building2, FileText,
  GitCompare, Settings, LogOut, Leaf,
  BarChart3, AlertCircle,
} from 'lucide-react'

const ADMIN_MENU = [
  { to: '/admin',           label: 'Dashboard',              icon: LayoutDashboard, end: true },
  { to: '/admin/companies', label: 'Firmalar',               icon: Building2 },
  { to: '/admin/reports',   label: 'Raporlar',               icon: FileText },
  { to: '/admin/scenarios', label: 'Tedarikçi Senaryoları',  icon: GitCompare },
  { to: '/admin/settings',  label: 'Ayarlar',                icon: Settings },
]

const USER_MENU = [
  { to: '/dashboard', label: 'Dashboard',            icon: LayoutDashboard, end: true },
  { to: '/calculate', label: 'Karbon Hesapla',       icon: BarChart3 },
  { to: '/suppliers', label: 'Tedarikçi Analizi',    icon: GitCompare },
  { to: '/missing',   label: 'Eksik Veri Analizi',   icon: AlertCircle },
  { to: '/reports',   label: 'Raporlar',             icon: FileText },
  { to: '/settings',  label: 'Ayarlar',              icon: Settings },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const menu = user?.role === 'admin' ? ADMIN_MENU : USER_MENU

  return (
    <aside style={{
      width: 232, minHeight: '100vh', background: '#0D1B2A',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '22px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg, #0D7A5F, #16A34A)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Leaf size={17} color="#fff" />
          </div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 17, letterSpacing: '-0.4px' }}>Passora</span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10.5, lineHeight: 1.4 }}>
          CBAM & Carbon Intelligence
        </p>
      </div>

      {/* Rol etiketi */}
      <div style={{ padding: '10px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <span style={{
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
          color: user?.role === 'admin' ? '#34D399' : '#60A5FA',
          background: user?.role === 'admin' ? 'rgba(52,211,153,0.1)' : 'rgba(96,165,250,0.1)',
          padding: '2px 8px', borderRadius: 4,
        }}>
          {user?.role === 'admin' ? 'Admin' : 'Carbon Officer'}
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px' }}>
        {menu.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to} to={to} end={end}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 11px', borderRadius: 8, marginBottom: 2,
              color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
              background: isActive ? 'rgba(13,122,95,0.3)' : 'transparent',
              textDecoration: 'none', fontSize: 13,
              fontWeight: isActive ? 600 : 400,
              borderLeft: isActive ? '3px solid #0D7A5F' : '3px solid transparent',
              transition: 'all 0.15s',
            })}
          >
            <Icon size={15} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Kullanıcı */}
      <div style={{ padding: '10px 10px 18px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ padding: '8px 11px', marginBottom: 2 }}>
          <p style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{user?.name}</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>{user?.email}</p>
        </div>
        <button
          onClick={() => { logout(); navigate('/login') }}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, width: '100%',
            padding: '8px 11px', borderRadius: 8, background: 'transparent',
            border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: 13,
          }}
        >
          <LogOut size={14} /> Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
