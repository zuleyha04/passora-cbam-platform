const BASE = '/api/auth'

export async function loginApi(email, password) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Geçersiz kullanıcı adı veya şifre.')
  return res.json()
}

export async function getMeApi(token) {
  const res = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Oturum geçersiz.')
  return res.json()
}
