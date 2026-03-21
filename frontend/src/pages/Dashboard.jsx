import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, Cell } from 'recharts'
import { api } from '../lib/api'
import { StatCard, ProgressBar, SectionLabel, DiffBadge, Spinner, CompanyTag } from '../components/ui'

function TopBar({ navigate }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '20px 32px', borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, background: 'rgba(10,10,10,0.92)',
      backdropFilter: 'blur(12px)', zIndex: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('/leetcode')} style={{ color: 'var(--text-3)', fontSize: '12px' }}>←</button>
        <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>kapilraghav</span>
        <span style={{ color: 'var(--border-2)' }}>/</span>
        <span style={{ fontSize: '13px', color: 'var(--green)' }}>leetcode</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-3)' }}>
        <span style={{ width: '6px', height: '6px', background: 'var(--green)', borderRadius: '50%', display: 'inline-block' }} />
        live
      </div>
    </div>
  )
}

function HeroSection({ stats }) {
  const pct = stats.total === 0 ? 0 : Math.round((stats.solved / stats.total) * 100)

  const radialData = [
    { name: 'solved', value: pct, fill: 'var(--green)' },
  ]

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px',
      padding: '40px 32px 32px', alignItems: 'center',
    }}>
      {/* Left: headline */}
      <div>
        <div style={{ fontSize: '11px', color: 'var(--green)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '16px' }}>
          progress report
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 60px)',
          fontWeight: 800, lineHeight: 1.1, color: 'var(--text)', letterSpacing: '-0.02em',
        }}>
          {stats.solved} problems<br />
          <span style={{ color: 'var(--green)' }}>solved.</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-2)', marginTop: '16px', lineHeight: 1.7 }}>
          out of {stats.total} tracked problems across {stats.topics_breakdown?.length || 0} topics
        </p>

        {/* Diff summary inline */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '32px' }}>
          {[
            { label: 'Easy', solved: stats.easy_solved, total: stats.easy_total, color: 'var(--green)' },
            { label: 'Medium', solved: stats.medium_solved, total: stats.medium_total, color: 'var(--amber)' },
            { label: 'Hard', solved: stats.hard_solved, total: stats.hard_total, color: 'var(--red)' },
          ].map(d => (
            <div key={d.label}>
              <div style={{ fontSize: '11px', color: d.color, marginBottom: '4px', letterSpacing: '0.05em' }}>{d.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
                {d.solved}<span style={{ fontSize: '14px', color: 'var(--text-3)', fontWeight: 400 }}>/{d.total}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: radial */}
      <div style={{ position: 'relative', height: '220px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            innerRadius="68%" outerRadius="88%"
            data={[{ value: 100, fill: 'var(--bg-3)' }, { value: pct, fill: 'var(--green)' }]}
            startAngle={90} endAngle={-270}
          >
            <RadialBar dataKey="value" cornerRadius={6} background={false} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 800, color: 'var(--text)' }}>{pct}%</div>
          <div style={{ fontSize: '11px', color: 'var(--text-3)', letterSpacing: '0.1em' }}>complete</div>
        </div>
      </div>
    </div>
  )
}

function TopicsGrid({ breakdown }) {
  return (
    <div style={{ padding: '0 32px 32px' }}>
      <SectionLabel>Topics breakdown</SectionLabel>
      <div style={{ display: 'grid', gap: '10px' }}>
        {breakdown.map(t => (
          <div key={t.topic} style={{
            display: 'grid', gridTemplateColumns: '180px 1fr 60px',
            alignItems: 'center', gap: '16px',
            padding: '12px 16px', background: 'var(--bg-2)',
            border: '1px solid var(--border)', borderRadius: 'var(--radius)',
          }}>
            <div style={{ fontSize: '13px', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.topic}</div>
            <ProgressBar
              value={t.solved} max={t.total}
              color={t.solved === t.total && t.total > 0 ? 'var(--green)' : 'var(--amber)'}
            />
            <div style={{ fontSize: '12px', color: 'var(--text-2)', textAlign: 'right' }}>{t.solved}/{t.total}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CompaniesSection({ companies }) {
  const max = companies[0]?.count || 1
  return (
    <div style={{ padding: '0 32px 40px' }}>
      <SectionLabel>Top companies asked</SectionLabel>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {companies.map(c => (
          <div key={c.company} style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: '6px 12px',
          }}>
            <span style={{ fontSize: '13px', color: 'var(--text)' }}>{c.company}</span>
            <span style={{
              fontSize: '10px', padding: '1px 6px', borderRadius: '100px',
              background: 'var(--bg-4)', color: 'var(--text-3)',
            }}>{c.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(e => setError(e.message))
  }, [])

  if (error) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)', fontSize: '13px' }}>
      error: {error}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <TopBar navigate={navigate} />

      {!stats ? <Spinner /> : (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* Hero */}
          <HeroSection stats={stats} />

          {/* Divider */}
          <div style={{ height: '1px', background: 'var(--border)', margin: '0 32px 32px' }} />

          {/* Stats row */}
          <div style={{ padding: '0 32px 32px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
            <StatCard
              label="Total Solved"
              value={stats.solved}
              sub={`out of ${stats.total}`}
              accent="var(--text)"
            />
            <StatCard
              label="Easy Solved"
              value={stats.easy_solved}
              sub={`${stats.easy_total} total`}
              accent="var(--green)"
            />
            <StatCard
              label="Hard Solved"
              value={stats.hard_solved}
              sub={`${stats.hard_total} total`}
              accent="var(--red)"
            />
          </div>

          {/* Topics */}
          {stats.topics_breakdown?.length > 0 && (
            <TopicsGrid breakdown={stats.topics_breakdown} />
          )}

          {/* Companies */}
          {stats.top_companies?.length > 0 && (
            <CompaniesSection companies={stats.top_companies} />
          )}

          {/* Footer */}
          <div style={{
            borderTop: '1px solid var(--border)', padding: '24px 32px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>kapilraghav.info · leetcode tracker</span>
            <button
              onClick={() => navigate('/leetcode')}
              style={{ fontSize: '11px', color: 'var(--text-3)' }}
            >
              ← back to home
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
