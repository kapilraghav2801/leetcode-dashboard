import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isAdmin) navigate('/leetcode/admin', { replace: true })
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [isAdmin])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/leetcode/admin')
    } catch (err) {
      setError(err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: 'var(--bg-2)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '13px',
    outline: 'none', fontFamily: 'var(--font-mono)',
    transition: 'border-color var(--transition)',
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', padding: '24px',
    }}>
      <div style={{
        width: '100%', maxWidth: '380px',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        {/* Back link */}
        <button
          onClick={() => navigate('/leetcode')}
          style={{ color: 'var(--text-3)', fontSize: '12px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          ← back
        </button>

        {/* Header */}
        <div style={{ marginBottom: '36px' }}>
          <div style={{ fontSize: '11px', color: 'var(--green)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>
            admin access
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text)' }}>
            Welcome back, Kapil
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-2)', marginTop: '8px' }}>
            Sign in to manage your progress
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-2)', marginBottom: '8px', letterSpacing: '0.08em' }}>
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="kapil"
              autoComplete="username"
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-2)', marginBottom: '8px', letterSpacing: '0.08em' }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••••"
              autoComplete="current-password"
              required
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'var(--green)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 14px', background: 'rgba(248,113,113,0.08)',
              border: '1px solid rgba(248,113,113,0.25)', borderRadius: 'var(--radius)',
              color: 'var(--red)', fontSize: '12px', marginBottom: '20px',
            }}>
              ✗ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px',
              background: loading ? 'var(--bg-3)' : 'var(--green)',
              border: 'none', borderRadius: 'var(--radius)',
              color: loading ? 'var(--text-2)' : '#0a0a0a',
              fontSize: '13px', fontWeight: 500, letterSpacing: '0.05em',
              transition: 'all var(--transition)',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'authenticating...' : 'Sign in →'}
          </button>
        </form>
      </div>
    </div>
  )
}
