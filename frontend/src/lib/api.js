const BASE = import.meta.env.VITE_API_URL || '/api/v1'

function getToken() {
  return localStorage.getItem('lc_token')
}

async function req(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem('lc_token')
    window.location.href = '/leetcode/login'
    return
  }

  if (res.status === 204) return null

  const data = await res.json()
  if (!res.ok) throw new Error(data.detail || 'Request failed')
  return data
}

export const api = {
  // Auth
  login: (username, password) =>
    req('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => req('/auth/me'),

  // Topics
  getTopics: () => req('/topics'),
  createTopic: (body) => req('/topics', { method: 'POST', body: JSON.stringify(body) }),
  updateTopic: (id, body) => req(`/topics/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteTopic: (id) => req(`/topics/${id}`, { method: 'DELETE' }),

  // Questions
  getQuestions: (topicId) => req(`/topics/${topicId}/questions`),
  getQuestion: (id) => req(`/questions/${id}`),
  createQuestion: (topicId, body) =>
    req(`/topics/${topicId}/questions`, { method: 'POST', body: JSON.stringify(body) }),
  updateQuestion: (id, body) =>
    req(`/questions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteQuestion: (id) => req(`/questions/${id}`, { method: 'DELETE' }),

  // Solutions
  getMySolution: (questionId) => req(`/questions/${questionId}/solutions/mine`),
  upsertMySolution: (questionId, body) =>
    req(`/questions/${questionId}/solutions/mine`, { method: 'PUT', body: JSON.stringify(body) }),
  getWebSolutions: (questionId) => req(`/questions/${questionId}/solutions/web`),

  // Stats
  getStats: () => req('/stats/summary'),
}
