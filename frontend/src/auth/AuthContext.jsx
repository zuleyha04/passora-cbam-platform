import { createContext, useContext, useState, useEffect } from 'react'
import { loginApi } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('passora_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('passora_user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch {}
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    const data = await loginApi(email, password)
    setToken(data.access_token)
    setUser(data.user)
    localStorage.setItem('passora_token', data.access_token)
    localStorage.setItem('passora_user', JSON.stringify(data.user))
    return data.user
  }

  function logout() {
    setToken(null)
    setUser(null)
    localStorage.removeItem('passora_token')
    localStorage.removeItem('passora_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
