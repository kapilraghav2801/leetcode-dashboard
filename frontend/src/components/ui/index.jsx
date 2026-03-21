// Difficulty badge
export function DiffBadge({ level }) {
  const colors = {
    Easy:   { color: 'var(--green)',  bg: 'var(--green-glow)',  border: 'rgba(74,222,128,0.2)' },
    Medium: { color: 'var(--amber)',  bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
    Hard:   { color: 'var(--red)',    bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)' },
  }
  const c = colors[level] || colors.Medium
  return (
    <span style={{
      fontSize: '10px', padding: '2px 8px', borderRadius: '100px',
      background: c.bg, border: `1px solid ${c.border}`, color: c.color,
      letterSpacing: '0.05em', fontWeight: 500,
    }}>
      {level}
    </span>
  )
}

// Solved checkmark
export function SolvedBadge({ solved }) {
  return (
    <span style={{
      fontSize: '11px',
      color: solved ? 'var(--green)' : 'var(--text-3)',
    }}>
      {solved ? '✓' : '○'}
    </span>
  )
}

// Company tag pill
export function CompanyTag({ name }) {
  return (
    <span style={{
      fontSize: '10px', padding: '2px 8px', borderRadius: '100px',
      background: 'var(--bg-3)', border: '1px solid var(--border)',
      color: 'var(--text-2)', letterSpacing: '0.03em',
    }}>
      {name}
    </span>
  )
}

// Section header
export function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.2em',
      textTransform: 'uppercase', marginBottom: '16px',
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      {children}
      <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
    </div>
  )
}

// Stat card
export function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px 24px',
    }}>
      <div style={{ fontSize: '11px', color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>{label}</div>
      <div style={{ fontSize: '32px', fontFamily: 'var(--font-display)', fontWeight: 700, color: accent || 'var(--text)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '6px' }}>{sub}</div>}
    </div>
  )
}

// Progress bar
export function ProgressBar({ value, max, color = 'var(--green)' }) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ flex: 1, height: '4px', background: 'var(--bg-4)', borderRadius: '2px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '2px', transition: 'width 0.8s ease' }} />
      </div>
      <span style={{ fontSize: '11px', color: 'var(--text-2)', minWidth: '32px', textAlign: 'right' }}>{pct}%</span>
    </div>
  )
}

// Loading spinner
export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', color: 'var(--text-3)', fontSize: '12px', gap: '10px' }}>
      <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>◌</span>
      loading...
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// Empty state
export function Empty({ message = 'Nothing here yet' }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-3)', fontSize: '13px' }}>
      <div style={{ fontSize: '24px', marginBottom: '12px', opacity: 0.4 }}>∅</div>
      {message}
    </div>
  )
}
