import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
})

// ─── Dashboard API ────────────────────────────────────────────────────────

const buildParams = ({ marketId, year, month, ...rest } = {}) => ({
  ...(marketId != null ? { market_id: marketId } : {}),
  ...(year    != null ? { year }                : {}),
  ...(month   != null ? { month }               : {}),
  ...rest,
})

export const dashboardApi = {
  getFilters: () =>
    api.get('/dashboard/filters').then(r => r.data),

  getOverview: (filters) =>
    api.get('/dashboard/overview', { params: buildParams(filters) }).then(r => r.data),

  getShops: (filters) =>
    api.get('/dashboard/shops', { params: buildParams(filters) }).then(r => r.data),

  getStalls: (filters) =>
    api.get('/dashboard/stalls', { params: buildParams(filters) }).then(r => r.data),

  getOpenTrade: (filters) =>
    api.get('/dashboard/open-trade', { params: buildParams(filters) }).then(r => r.data),

  getDebts: (filters) =>
    api.get('/dashboard/debts', { params: buildParams(filters) }).then(r => r.data),

  getTopDebtors: (filters) =>
    api.get('/dashboard/top-debtors', { params: buildParams(filters) }).then(r => r.data),

  getVehicleEntries: (filters) =>
    api.get('/dashboard/vehicle-entries', { params: buildParams(filters) }).then(r => r.data),
}

// ─── Agent API ────────────────────────────────────────────────────────────

export const agentApi = {
  chat: (messages, context = null) =>
    api.post('/agent/chat', { messages, context }).then(r => r.data),
}

export default api
