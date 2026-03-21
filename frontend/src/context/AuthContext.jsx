import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('lc_token')
    if (token) {
      api.me()
        .then(() => setIsAdmin(true))
        .catch(() => {
          localStorage.removeItem('lc_token')
          setIsAdmin(false)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const data = await api.login(username, password)
    localStorage.setItem('lc_token', data.access_token)
    setIsAdmin(true)
  }

  const logout = () => {
    localStorage.removeItem('lc_token')
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
