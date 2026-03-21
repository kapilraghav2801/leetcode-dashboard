import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../lib/api'
import { DiffBadge, SolvedBadge, CompanyTag, SectionLabel, ProgressBar, Spinner, Empty } from '../components/ui'

// ─── Tiny shared form components ─────────────────────────────────────────────

function Input({ label, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ marginBottom: '14px' }}>
      {label && <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</label>}
      <input
        {...props}
        onFocus={e => { setFocused(true); props.onFocus?.(e) }}
        onBlur={e => { setFocused(false); props.onBlur?.(e) }}
        style={{
          width: '100%', padding: '9px 12px',
          background: 'var(--bg-3)', border: `1px solid ${focused ? 'var(--green)' : 'var(--border)'}`,
          borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '13px',
          fontFamily: 'var(--font-mono)', outline: 'none', transition: 'border-color var(--transition)',
          ...props.style,
        }}
      />
    </div>
  )
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      {label && <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</label>}
      <select
        {...props}
        style={{
          width: '100%', padding: '9px 12px',
          background: 'var(--bg-3)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '13px',
          fontFamily: 'var(--font-mono)', outline: 'none', cursor: 'pointer',
        }}
      >
        {children}
      </select>
    </div>
  )
}

function Textarea({ label, ...props }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      {label && <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>{label}</label>}
      <textarea
        {...props}
        style={{
          width: '100%', padding: '9px 12px',
          background: 'var(--bg-3)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '13px',
          fontFamily: 'var(--font-mono)', outline: 'none', resize: 'vertical', minHeight: '100px',
          ...props.style,
        }}
      />
    </div>
  )
}

function Btn({ variant = 'default', children, ...props }) {
  const styles = {
    default: { background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-2)' },
    primary: { background: 'var(--green)', border: '1px solid var(--green)', color: '#0a0a0a' },
    danger:  { background: 'transparent', border: '1px solid rgba(248,113,113,0.3)', color: 'var(--red)' },
    ghost:   { background: 'transparent', border: 'none', color: 'var(--text-3)' },
  }
  const s = styles[variant]
  return (
    <button
      {...props}
      style={{
        padding: '7px 14px', borderRadius: 'var(--radius)', fontSize: '12px',
        fontFamily: 'var(--font-mono)', cursor: 'pointer', transition: 'all var(--transition)',
        ...s, ...props.style,
        opacity: props.disabled ? 0.5 : 1,
      }}
    >
      {children}
    </button>
  )
}

// ─── Companies editor ─────────────────────────────────────────────────────────

function CompaniesEditor({ companies, onChange }) {
  const [input, setInput] = useState('')

  const add = () => {
    const val = input.trim()
    if (val && !companies.includes(val)) {
      onChange([...companies, val])
    }
    setInput('')
  }

  const remove = (c) => onChange(companies.filter(x => x !== c))

  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px' }}>
        Companies that ask this
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
        {companies.map(c => (
          <span key={c} style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            background: 'var(--bg-4)', border: '1px solid var(--border)',
            borderRadius: '100px', padding: '2px 10px', fontSize: '11px', color: 'var(--text-2)',
          }}>
            {c}
            <button onClick={() => remove(c)} style={{ color: 'var(--text-3)', fontSize: '12px', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
          </span>
        ))}
        {companies.length === 0 && <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>no companies added yet</span>}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="Google, Amazon, Meta..."
          style={{
            flex: 1, padding: '7px 10px',
            background: 'var(--bg-3)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '12px',
            fontFamily: 'var(--font-mono)', outline: 'none',
          }}
        />
        <Btn onClick={add}>+ Add</Btn>
      </div>
    </div>
  )
}

// ─── Solution panel ───────────────────────────────────────────────────────────

function SolutionPanel({ questionId, questionTitle }) {
  const [tab, setTab] = useState('mine')
  const [mine, setMine] = useState(null)
  const [webResults, setWebResults] = useState(null)
  const [loadingWeb, setLoadingWeb] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ code: '', language: 'python', time_complexity: '', space_complexity: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getMySolution(questionId).then(setMine).catch(() => {})
  }, [questionId])

  const fetchWeb = async () => {
    if (webResults) { setTab('web'); return }
    setLoadingWeb(true)
    setTab('web')
    try {
      const r = await api.getWebSolutions(questionId)
      setWebResults(r)
    } catch (e) {
      setWebResults([])
    } finally {
      setLoadingWeb(false)
    }
  }

  const startEdit = () => {
    setForm({
      code: mine?.code || '',
      language: mine?.language || 'python',
      time_complexity: mine?.time_complexity || '',
      space_complexity: mine?.space_complexity || '',
    })
    setEditing(true)
  }

  const save = async () => {
    setSaving(true)
    try {
      const updated = await api.upsertMySolution(questionId, form)
      setMine(updated)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const tabStyle = (active) => ({
    padding: '6px 14px', fontSize: '12px', borderRadius: 'var(--radius)',
    background: active ? 'var(--bg-3)' : 'transparent',
    border: active ? '1px solid var(--border)' : '1px solid transparent',
    color: active ? 'var(--text)' : 'var(--text-3)',
    cursor: 'pointer',
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button style={tabStyle(tab === 'mine')} onClick={() => setTab('mine')}>My Solution</button>
        <button style={tabStyle(tab === 'web')} onClick={fetchWeb}>Web Solutions ↗</button>
      </div>

      {tab === 'mine' && (
        <div>
          {!editing ? (
            mine ? (
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{mine.language}</span>
                  {mine.time_complexity && <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>· T: {mine.time_complexity}</span>}
                  {mine.space_complexity && <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>· S: {mine.space_complexity}</span>}
                  <Btn style={{ marginLeft: 'auto' }} onClick={startEdit}>Edit</Btn>
                </div>
                <pre style={{
                  background: 'var(--bg-3)', border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)', padding: '14px', fontSize: '12px',
                  color: 'var(--text)', overflowX: 'auto', lineHeight: 1.7,
                  maxHeight: '300px', overflowY: 'auto',
                }}>
                  {mine.code}
                </pre>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-3)', fontSize: '13px' }}>
                <div style={{ marginBottom: '12px', opacity: 0.5 }}>No solution added yet</div>
                <Btn variant="primary" onClick={startEdit}>+ Add my solution</Btn>
              </div>
            )
          ) : (
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <Select label="" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} style={{ marginBottom: 0, width: 'auto' }}>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="javascript">JavaScript</option>
                </Select>
                <input placeholder="T: O(n)" value={form.time_complexity} onChange={e => setForm(f => ({ ...f, time_complexity: e.target.value }))}
                  style={{ padding: '7px 10px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '12px', fontFamily: 'var(--font-mono)', outline: 'none', width: '100px' }} />
                <input placeholder="S: O(1)" value={form.space_complexity} onChange={e => setForm(f => ({ ...f, space_complexity: e.target.value }))}
                  style={{ padding: '7px 10px', background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', color: 'var(--text)', fontSize: '12px', fontFamily: 'var(--font-mono)', outline: 'none', width: '100px' }} />
              </div>
              <Textarea
                label="Code"
                value={form.code}
                onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                placeholder="# your solution here..."
                style={{ minHeight: '200px', fontSize: '12px' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'saving...' : 'Save solution'}</Btn>
                <Btn onClick={() => setEditing(false)}>Cancel</Btn>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'web' && (
        <div>
          {loadingWeb ? (
            <div style={{ color: 'var(--text-3)', fontSize: '12px', padding: '20px 0' }}>fetching solutions...</div>
          ) : webResults?.length === 0 ? (
            <Empty message="No web solutions found" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {webResults?.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 14px', background: 'var(--bg-3)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                    transition: 'border-color var(--transition)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--text)', marginBottom: '2px' }}>{r.title}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-3)' }}>{r.source}</div>
                  </div>
                  <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>↗</span>
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Question row ─────────────────────────────────────────────────────────────

function QuestionRow({ q, onUpdate, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    title: q.title, difficulty: q.difficulty, leetcode_url: q.leetcode_url || '',
    companies: q.companies || [], notes: q.notes || '', is_solved: q.is_solved,
  })
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const updated = await api.updateQuestion(q.id, form)
      onUpdate(updated)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const del = async () => {
    if (!confirm(`Delete "${q.title}"?`)) return
    await api.deleteQuestion(q.id)
    onDelete(q.id)
  }

  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
      {/* Row header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', cursor: 'pointer' }}
        onClick={() => setExpanded(e => !e)}>
        <span style={{ color: q.is_solved ? 'var(--green)' : 'var(--text-3)', fontSize: '12px' }}>{q.is_solved ? '✓' : '○'}</span>
        <span style={{ flex: 1, fontSize: '13px', color: 'var(--text)' }}>{q.title}</span>
        <DiffBadge level={q.difficulty} />
        {q.companies?.length > 0 && (
          <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>{q.companies.length} co.</span>
        )}
        {q.leetcode_url && (
          <a href={q.leetcode_url} target="_blank" rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            style={{ fontSize: '10px', color: 'var(--text-3)', padding: '2px 6px', border: '1px solid var(--border)', borderRadius: '4px' }}>
            LC ↗
          </a>
        )}
        <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>{expanded ? '▲' : '▼'}</span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 14px' }}>
          {!editing ? (
            <>
              {/* Companies */}
              {q.companies?.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {q.companies.map(c => <CompanyTag key={c} name={c} />)}
                </div>
              )}
              {q.notes && <p style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '12px', lineHeight: 1.7 }}>{q.notes}</p>}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <Btn onClick={() => setEditing(true)}>Edit</Btn>
                <Btn
                  variant={q.is_solved ? 'default' : 'primary'}
                  onClick={async () => {
                    const updated = await api.updateQuestion(q.id, { is_solved: !q.is_solved })
                    onUpdate(updated)
                  }}
                >
                  {q.is_solved ? 'Mark unsolved' : '✓ Mark solved'}
                </Btn>
                <Btn variant="danger" onClick={del}>Delete</Btn>
              </div>

              {/* Solution panel */}
              <SectionLabel>Solutions</SectionLabel>
              <SolutionPanel questionId={q.id} questionTitle={q.title} />
            </>
          ) : (
            <div>
              <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <Select label="Difficulty" value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))}>
                <option>Easy</option><option>Medium</option><option>Hard</option>
              </Select>
              <Input label="LeetCode URL" value={form.leetcode_url} onChange={e => setForm(f => ({ ...f, leetcode_url: e.target.value }))} placeholder="https://leetcode.com/problems/..." />
              <CompaniesEditor companies={form.companies} onChange={c => setForm(f => ({ ...f, companies: c }))} />
              <Textarea label="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Key insight, approach..." />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '14px' }}>
                <input type="checkbox" id={`solved-${q.id}`} checked={form.is_solved} onChange={e => setForm(f => ({ ...f, is_solved: e.target.checked }))} />
                <label htmlFor={`solved-${q.id}`} style={{ fontSize: '12px', color: 'var(--text-2)' }}>Solved</label>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Btn variant="primary" onClick={save} disabled={saving}>{saving ? 'saving...' : 'Save'}</Btn>
                <Btn onClick={() => setEditing(false)}>Cancel</Btn>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Topic card ───────────────────────────────────────────────────────────────

function TopicCard({ topic, onTopicUpdate, onTopicDelete }) {
  const [open, setOpen] = useState(false)
  const [questions, setQuestions] = useState(null)
  const [addingQ, setAddingQ] = useState(false)
  const [qForm, setQForm] = useState({ title: '', difficulty: 'Medium', leetcode_url: '', companies: [], notes: '', is_solved: false })
  const [savingQ, setSavingQ] = useState(false)
  const [editingTopic, setEditingTopic] = useState(false)
  const [topicForm, setTopicForm] = useState({ title: topic.title, description: topic.description || '' })

  const loadQuestions = async () => {
    if (questions) return
    const qs = await api.getQuestions(topic.id)
    setQuestions(qs)
  }

  const toggleOpen = () => {
    if (!open) loadQuestions()
    setOpen(o => !o)
  }

  const addQuestion = async () => {
    if (!qForm.title.trim()) return
    setSavingQ(true)
    try {
      const q = await api.createQuestion(topic.id, qForm)
      setQuestions(qs => [...(qs || []), q])
      setQForm({ title: '', difficulty: 'Medium', leetcode_url: '', companies: [], notes: '', is_solved: false })
      setAddingQ(false)
    } finally {
      setSavingQ(false)
    }
  }

  const saveTopic = async () => {
    const updated = await api.updateTopic(topic.id, topicForm)
    onTopicUpdate(updated)
    setEditingTopic(false)
  }

  const deleteTopic = async () => {
    if (!confirm(`Delete topic "${topic.title}" and all its questions?`)) return
    await api.deleteTopic(topic.id)
    onTopicDelete(topic.id)
  }

  const solved = questions ? questions.filter(q => q.is_solved).length : topic.solved_count
  const total = questions ? questions.length : topic.question_count

  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
      {/* Topic header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 20px', cursor: 'pointer' }}
        onClick={toggleOpen}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>{topic.title}</span>
            {topic.description && <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>{topic.description}</span>}
          </div>
          <div style={{ marginTop: '8px' }}>
            <ProgressBar value={solved} max={total} />
          </div>
        </div>
        <div style={{ textAlign: 'right', minWidth: '60px' }}>
          <div style={{ fontSize: '18px', fontFamily: 'var(--font-display)', fontWeight: 700, color: solved === total && total > 0 ? 'var(--green)' : 'var(--text)' }}>{solved}/{total}</div>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>{open ? '▲' : '▼'}</span>
      </div>

      {/* Expanded content */}
      {open && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
          {/* Topic actions */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <Btn onClick={() => setAddingQ(a => !a)} variant="primary">+ Add question</Btn>
            <Btn onClick={() => { setEditingTopic(e => !e); setTopicForm({ title: topic.title, description: topic.description || '' }) }}>Edit topic</Btn>
            <Btn variant="danger" onClick={deleteTopic}>Delete topic</Btn>
          </div>

          {/* Edit topic inline */}
          {editingTopic && (
            <div style={{ padding: '14px', background: 'var(--bg-3)', borderRadius: 'var(--radius)', marginBottom: '16px', border: '1px solid var(--border)' }}>
              <Input label="Topic title" value={topicForm.title} onChange={e => setTopicForm(f => ({ ...f, title: e.target.value }))} />
              <Input label="Description (optional)" value={topicForm.description} onChange={e => setTopicForm(f => ({ ...f, description: e.target.value }))} />
              <div style={{ display: 'flex', gap: '8px' }}>
                <Btn variant="primary" onClick={saveTopic}>Save</Btn>
                <Btn onClick={() => setEditingTopic(false)}>Cancel</Btn>
              </div>
            </div>
          )}

          {/* Add question form */}
          {addingQ && (
            <div style={{ padding: '14px', background: 'var(--bg-3)', borderRadius: 'var(--radius)', marginBottom: '16px', border: '1px solid var(--border)' }}>
              <Input label="Question title" value={qForm.title} onChange={e => setQForm(f => ({ ...f, title: e.target.value }))} placeholder="Two Sum" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                <Select label="Difficulty" value={qForm.difficulty} onChange={e => setQForm(f => ({ ...f, difficulty: e.target.value }))}>
                  <option>Easy</option><option>Medium</option><option>Hard</option>
                </Select>
                <Input label="LeetCode URL" value={qForm.leetcode_url} onChange={e => setQForm(f => ({ ...f, leetcode_url: e.target.value }))} placeholder="https://leetcode.com/problems/..." />
              </div>
              <CompaniesEditor companies={qForm.companies} onChange={c => setQForm(f => ({ ...f, companies: c }))} />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
                <input type="checkbox" id="new-solved" checked={qForm.is_solved} onChange={e => setQForm(f => ({ ...f, is_solved: e.target.checked }))} />
                <label htmlFor="new-solved" style={{ fontSize: '12px', color: 'var(--text-2)' }}>Already solved</label>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Btn variant="primary" onClick={addQuestion} disabled={savingQ}>{savingQ ? 'adding...' : 'Add question'}</Btn>
                <Btn onClick={() => setAddingQ(false)}>Cancel</Btn>
              </div>
            </div>
          )}

          {/* Question list */}
          {questions === null ? <Spinner /> : questions.length === 0 ? (
            <Empty message="No questions yet. Add one above." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {questions.map(q => (
                <QuestionRow
                  key={q.id}
                  q={q}
                  onUpdate={updated => setQuestions(qs => qs.map(x => x.id === updated.id ? updated : x))}
                  onDelete={id => setQuestions(qs => qs.filter(x => x.id !== id))}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Admin page ───────────────────────────────────────────────────────────────

export default function Admin() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [addingTopic, setAddingTopic] = useState(false)
  const [topicForm, setTopicForm] = useState({ title: '', description: '', order: 0 })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getTopics().then(setTopics).finally(() => setLoading(false))
  }, [])

  const createTopic = async () => {
    if (!topicForm.title.trim()) return
    setSaving(true)
    try {
      const t = await api.createTopic(topicForm)
      setTopics(ts => [...ts, t])
      setTopicForm({ title: '', description: '', order: 0 })
      setAddingTopic(false)
    } finally {
      setSaving(false)
    }
  }

  const totalSolved = topics.reduce((a, t) => a + t.solved_count, 0)
  const totalQ = topics.reduce((a, t) => a + t.question_count, 0)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 28px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: 'rgba(10,10,10,0.94)',
        backdropFilter: 'blur(12px)', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('/leetcode')} style={{ color: 'var(--text-3)', fontSize: '12px' }}>←</button>
          <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>kapilraghav</span>
          <span style={{ color: 'var(--border-2)' }}>/</span>
          <span style={{ fontSize: '13px', color: 'var(--green)' }}>admin</span>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>{totalSolved}/{totalQ} solved</span>
          <Btn onClick={() => navigate('/leetcode/dashboard')}>View public</Btn>
          <Btn variant="ghost" onClick={() => { logout(); navigate('/leetcode') }}>Sign out</Btn>
        </div>
      </div>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, color: 'var(--text)' }}>
              Admin Panel
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-3)', marginTop: '6px' }}>
              {topics.length} topics · {totalQ} questions
            </p>
          </div>
          <Btn variant="primary" onClick={() => setAddingTopic(a => !a)}>+ New topic</Btn>
        </div>

        {/* Add topic form */}
        {addingTopic && (
          <div style={{
            padding: '20px', background: 'var(--bg-2)', border: '1px solid var(--green)',
            borderRadius: 'var(--radius-lg)', marginBottom: '24px',
          }}>
            <div style={{ fontSize: '11px', color: 'var(--green)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>new topic</div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
              <Input label="Title" value={topicForm.title} onChange={e => setTopicForm(f => ({ ...f, title: e.target.value }))} placeholder="Arrays, Dynamic Programming..." />
              <Input label="Order (sort)" type="number" value={topicForm.order} onChange={e => setTopicForm(f => ({ ...f, order: +e.target.value }))} />
            </div>
            <Input label="Description (optional)" value={topicForm.description} onChange={e => setTopicForm(f => ({ ...f, description: e.target.value }))} />
            <div style={{ display: 'flex', gap: '8px' }}>
              <Btn variant="primary" onClick={createTopic} disabled={saving}>{saving ? 'creating...' : 'Create topic'}</Btn>
              <Btn onClick={() => setAddingTopic(false)}>Cancel</Btn>
            </div>
          </div>
        )}

        {/* Topics list */}
        {loading ? <Spinner /> : topics.length === 0 ? (
          <Empty message="No topics yet. Create your first one above." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {topics.map(t => (
              <TopicCard
                key={t.id}
                topic={t}
                onTopicUpdate={updated => setTopics(ts => ts.map(x => x.id === updated.id ? updated : x))}
                onTopicDelete={id => setTopics(ts => ts.filter(x => x.id !== id))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
