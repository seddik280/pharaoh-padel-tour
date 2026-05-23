import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('pp_token') || null)
  const [loading, setLoading] = useState(true)

  const normalize = (u) => ({ ...u, id: u.id || u._id })

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.get('/api/users/me')
        .then(res => setUser(normalize(res.data)))
        .catch(() => logout())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password })
    setToken(res.data.token)
    setUser(res.data.user)
    localStorage.setItem('pp_token', res.data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    return res.data.user
  }

  const register = async (name, email, password) => {
    const res = await axios.post('/api/auth/register', { name, email, password })
    setToken(res.data.token)
    setUser(res.data.user)
    localStorage.setItem('pp_token', res.data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`
    return res.data.user
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('pp_token')
    delete axios.defaults.headers.common['Authorization']
  }

  const refreshUser = async () => {
    const res = await axios.get('/api/users/me')
    const u = normalize(res.data)
    setUser(u)
    return u
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
