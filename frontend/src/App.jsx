import './index.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Admin from './pages/Admin'

function ProtectedRoute({ children }) {
  const { isAdmin, loading } = useAuth()
  if (loading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'var(--text-2)', fontFamily: 'var(--font-mono)', fontSize: '13px' }}>checking auth...</div>
  if (!isAdmin) return <Navigate to="/leetcode/login" replace />
  return children
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/leetcode" element={<Landing />} />
          <Route path="/leetcode/login" element={<Login />} />
          <Route path="/leetcode/dashboard" element={<Dashboard />} />
          <Route path="/leetcode/admin" element={
            <ProtectedRoute><Admin /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/leetcode" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
