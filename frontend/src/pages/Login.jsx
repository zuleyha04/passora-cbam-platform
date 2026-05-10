import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Leaf, Lock, Mail, AlertCircle } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.message || 'Giriş başarısız.')
    } finally {
      setLoading(false)
    }
  }

  function fillDemo(type) {
    if (type === 'admin') { setEmail('admin@passora.com'); setPassword('admin123') }
    else { setEmail('user@passora.com'); setPassword('user123') }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--color-bg)' }}>
      {/* Left panel */}
      <div style={{
        width: '45%', background: 'linear-gradient(160deg, #0D1B2A 0%, #0D7A5F 100%)',
        padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Leaf size={24} color="#fff" />
          </div>
          <span style={{ color: '#fff', fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Passora</span>
        </div>

        <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 12, lineHeight: 1.3 }}>
          CBAM Readiness &<br />Carbon Intelligence Platform
        </h2>

        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6, marginBottom: 40 }}>
          Demir-çelik ihracatçıları için karbon emisyonu, veri kalitesi, EPD benchmark ve tedarikçi senaryo analizi.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            ['🏭', 'Tesis bazlı emisyon hesaplama'],
            ['📊', 'EPD benchmark karşılaştırması'],
            ['🔍', 'Eksik veri & veri kalite skoru'],
            ['💡', 'AI destekli azaltım önerileri'],
            ['🔄', 'Alternatif tedarikçi simülasyonu'],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 48 }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
            CBAM Implementing Regulation (EU) 2023/1773 uyumlu
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 6 }}>Giriş Yap</h2>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 32, fontSize: 14 }}>
            Hesabınıza erişmek için bilgilerinizi girin.
          </p>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>E-posta</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="ornek@firma.com" required
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Şifre</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  style={{ paddingLeft: 38 }}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '11px', fontSize: 15 }} disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{ marginTop: 28, padding: 16, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 12 }}>🔑 DEMO HESAPLAR</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600 }}>Admin</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>admin@passora.com / admin123</p>
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => fillDemo('admin')}>Doldur</button>
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600 }}>Fabrika Kullanıcısı</p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>user@passora.com / user123</p>
                </div>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => fillDemo('user')}>Doldur</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
