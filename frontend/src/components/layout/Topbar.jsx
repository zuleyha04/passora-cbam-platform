import { Bell } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth()
  return (
    <header style={{
      height: 60,
      background: '#fff',
      borderBottom: '1px solid var(--color-border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
    }}>
      <div>
        {title && <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>{title}</h1>}
        {subtitle && <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 1 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'var(--color-primary-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: 13, color: 'var(--color-primary)',
        }}>
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  )
}
