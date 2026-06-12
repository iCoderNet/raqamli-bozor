import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 20000,
})

// Attach token to every request
api.interceptors.request.use(cfg => {
  const token = sessionStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Redirect to login on 401
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      window.location.reload()
    }
    return Promise.reject(err)
  }
)

// ─── Auth API ─────────────────────────────────────────────────────────────

export const authApi = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }).then(r => r.data),
  me: () =>
    api.get('/auth/me').then(r => r.data),
}

// ─── Dashboard API ────────────────────────────────────────────────────────

const buildParams = ({ marketId, year, month, ...rest } = {}) => ({
  ...(marketId != null ? { market_id: marketId } : {}),
  ...(year    != null ? { year }                : {}),
  ...(month   != null ? { month }               : {}),
  ...rest,
})

export const dashboardApi = {
  getFilters:       ()        => api.get('/dashboard/filters').then(r => r.data),
  getOverview:      (f)       => api.get('/dashboard/overview',      { params: buildParams(f) }).then(r => r.data),
  getShops:         (f)       => api.get('/dashboard/shops',         { params: buildParams(f) }).then(r => r.data),
  getStalls:        (f)       => api.get('/dashboard/stalls',        { params: buildParams(f) }).then(r => r.data),
  getOpenTrade:     (f)       => api.get('/dashboard/open-trade',    { params: buildParams(f) }).then(r => r.data),
  getDebts:         (f)       => api.get('/dashboard/debts',         { params: buildParams(f) }).then(r => r.data),
  getTopDebtors:    (f)       => api.get('/dashboard/top-debtors',   { params: buildParams(f) }).then(r => r.data),
  getVehicleEntries:(f)       => api.get('/dashboard/vehicle-entries',{ params: buildParams(f) }).then(r => r.data),
}

// ─── Agent API ────────────────────────────────────────────────────────────

export const agentApi = {
  chat: (messages) =>
    api.post('/agent/chat', { messages }).then(r => r.data),
}

export default api
