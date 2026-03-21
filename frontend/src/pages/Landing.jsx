import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const CHARS = '01アイウエオカキクケコ∑∂∇⊕⊗∈∉∅'

function GlitchChar({ delay }) {
  const [char, setChar] = useState(' ')
  useEffect(() => {
    const t = setTimeout(() => {
      const interval = setInterval(() => {
        setChar(CHARS[Math.floor(Math.random() * CHARS.length)])
      }, 60)
      setTimeout(() => clearInterval(interval), 600)
    }, delay)
    return () => clearTimeout(t)
  }, [delay])
  return <span style={{ opacity: 0.15, fontSize: '11px', color: 'var(--green)' }}>{char}</span>
}

function GridBackground() {
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      backgroundImage: `
        linear-gradient(rgba(74,222,128,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(74,222,128,0.03) 1px, transparent 1px)
      `,
      backgroundSize: '40px 40px',
    }} />
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [hovered, setHovered] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', position: 'relative', overflow: 'hidden',
    }}>
      <GridBackground />

      {/* Noise glitch chars scattered */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${(i * 7.3) % 95}%`,
            top: `${(i * 11.7) % 95}%`,
          }}>
            <GlitchChar delay={i * 80} />
          </div>
        ))}
      </div>

      <div style={{
        position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px',
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}>

        {/* Top tag */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'var(--green-glow)', border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: '100px', padding: '4px 14px', marginBottom: '48px',
          fontSize: '11px', color: 'var(--green)', letterSpacing: '0.15em',
          textTransform: 'uppercase',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 2s ease infinite' }} />
          kapilraghav.info / leetcode
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 8vw, 80px)',
          fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.02em',
          color: 'var(--text)', marginBottom: '16px',
        }}>
          DSA Progress<br />
          <span style={{ color: 'var(--green)' }}>Dashboard</span>
        </h1>

        <p style={{
          fontSize: '14px', color: 'var(--text-2)', marginBottom: '64px',
          maxWidth: '360px', margin: '0 auto 64px', lineHeight: 1.7,
        }}>
          A personal tracker for algorithms, data structures, and interview prep. Who's visiting?
        </p>

        {/* Two choices */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Kapil button */}
          <button
            onMouseEnter={() => setHovered('kapil')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => navigate(isAdmin ? '/leetcode/admin' : '/leetcode/login')}
            style={{
              position: 'relative', padding: '18px 36px',
              background: hovered === 'kapil' ? 'var(--green)' : 'transparent',
              border: '1px solid var(--green)',
              borderRadius: 'var(--radius)',
              color: hovered === 'kapil' ? '#0a0a0a' : 'var(--green)',
              fontSize: '14px', fontWeight: 500, letterSpacing: '0.05em',
              transition: 'all var(--transition)',
              minWidth: '200px',
            }}
          >
            <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px', fontWeight: 400 }}>
              {hovered === 'kapil' ? '→ go to admin' : '$ whoami'}
            </div>
            I'm Kapil
          </button>

          {/* Visitor button */}
          <button
            onMouseEnter={() => setHovered('visitor')}
            onMouseLeave={() => setHovered(null)}
            onClick={() => navigate('/leetcode/dashboard')}
            style={{
              position: 'relative', padding: '18px 36px',
              background: hovered === 'visitor' ? 'var(--text)' : 'transparent',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius)',
              color: hovered === 'visitor' ? '#0a0a0a' : 'var(--text-2)',
              fontSize: '14px', fontWeight: 500, letterSpacing: '0.05em',
              transition: 'all var(--transition)',
              minWidth: '200px',
            }}
          >
            <div style={{ fontSize: '11px', opacity: 0.6, marginBottom: '4px', fontWeight: 400 }}>
              {hovered === 'visitor' ? '→ view stats' : '$ cat visitor.txt'}
            </div>
            Just browsing
          </button>
        </div>

        {/* Footer hint */}
        <div style={{
          marginTop: '80px', fontSize: '11px', color: 'var(--text-3)',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.05em',
        }}>
          built with FastAPI · React · PostgreSQL
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
