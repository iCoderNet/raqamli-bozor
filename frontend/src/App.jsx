import React, { useState } from 'react'
import { RefreshCw, BarChart3, Sun, Moon, LogOut, User } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { useFilters, useOverview } from './hooks/useDashboard'
import Login           from './components/Login'
import OverviewSection from './components/OverviewSection'
import TradeSection    from './components/TradeSection'
import DebtSection     from './components/DebtSection'
import VehicleSection  from './components/VehicleSection'
import TopDebtorsTable from './components/TopDebtorsTable'
import AgentChat       from './components/AgentChat'

const MONTHS = ['', 'Yanvar','Fevral','Mart','Aprel','May','Iyun',
                    'Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']

const now   = dayjs()
const YEARS = [now.year() - 1, now.year(), now.year() + 1]

// ─── Auth helpers ──────────────────────────────────────────────────────────
function getSavedUser() {
  try { return JSON.parse(sessionStorage.getItem('user') || 'null') }
  catch { return null }
}

// ─── Main App ──────────────────────────────────────────────────────────────
export default function App() {
  const [user,     setUser]     = useState(getSavedUser)
  const [theme,    setTheme]    = useState('raqamli')
  const [marketId, setMarketId] = useState(null)
  const [year,     setYear]     = useState(now.year())
  const [month,    setMonth]    = useState(now.month() + 1)

  const qc = useQueryClient()
  const filters = { marketId, year, month }

  // ─── Login gate ────────────────────────────────────────────────────────
  if (!user) {
    return <Login onLogin={u => setUser(u)} />
  }

  // ─── Handlers ──────────────────────────────────────────────────────────
  function logout() {
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
    setUser(null)
    qc.clear()
  }

  function toggleTheme() {
    const next = theme === 'raqamli' ? 'dark' : 'raqamli'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <div className="min-h-screen bg-base-100">

      {/* ─── Navbar ─── */}
      <div className="navbar bg-base-100 border-b border-base-200 px-4 md:px-6 sticky top-0 z-30 shadow-sm">

        {/* Logo */}
        <div className="navbar-start gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary
                            flex items-center justify-center shadow-sm flex-shrink-0">
              <BarChart3 size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-base-content leading-tight">Raqamli Bozor</p>
              <p className="text-xs text-base-content/50 leading-tight">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="navbar-end flex items-center gap-1.5 flex-wrap justify-end">

          {/* Year */}
          <select className="select select-bordered select-sm"
            value={year} onChange={e => setYear(Number(e.target.value))}>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Month */}
          <select className="select select-bordered select-sm"
            value={month} onChange={e => setMonth(Number(e.target.value))}>
            {MONTHS.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
          </select>

          {/* Market */}
          <MarketSelect marketId={marketId} onChange={setMarketId} />

          {/* Refresh */}
          <button onClick={() => qc.invalidateQueries()}
            className="btn btn-ghost btn-sm btn-square" title="Yangilash">
            <RefreshCw size={15} />
          </button>

          {/* Theme */}
          <button onClick={toggleTheme}
            className="btn btn-ghost btn-sm btn-square" title="Tema">
            {theme === 'raqamli' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {/* User menu */}
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-sm gap-2 pl-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <User size={14} className="text-primary" />
              </div>
              <span className="hidden md:inline text-sm font-medium text-base-content">
                {user.full_name || user.username}
              </span>
            </button>
            <ul tabIndex={0} className="dropdown-content menu menu-sm shadow-lg bg-base-100
                                        border border-base-200 rounded-xl w-52 z-50 mt-2">
              <li className="menu-title px-4 py-2">
                <span className="text-xs text-base-content/50">{user.username}</span>
                <span className="badge badge-xs badge-primary ml-1">{user.role}</span>
              </li>
              <li>
                <button onClick={logout} className="text-error hover:bg-error/10 gap-2">
                  <LogOut size={14} /> Chiqish
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ─── Content ─── */}
      <main className="px-4 md:px-6 py-6 max-w-screen-xl mx-auto flex flex-col gap-8">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-base-content">
              <MarketTitle marketId={marketId} />
            </h1>
            <p className="text-sm text-base-content/50 mt-0.5">
              {MONTHS[month]} {year} — Statistik ko'rsatkichlar
            </p>
          </div>
        </div>

        <OverviewSection  filters={filters} />
        <TradeSection     filters={filters} />
        <DebtSection      filters={filters} />
        <VehicleSection   filters={filters} />
        <TopDebtorsTable  filters={filters} />

        <footer className="text-center text-xs text-base-content/30 pb-4">
          © {now.year()} Raqamli Bozor — Andijon viloyati
        </footer>
      </main>

      <AgentChat />
    </div>
  )
}

// ─── Sub-components ────────────────────────────────────────────────────────

function MarketSelect({ marketId, onChange }) {
  const { data, isLoading } = useFilters()
  const markets = data?.markets || []
  return (
    <select
      className="select select-bordered select-sm min-w-[11rem] font-medium"
      value={marketId ?? ''}
      onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
      disabled={isLoading}
    >
      <option value="">🏪 Barcha bozorlar</option>
      {markets.map(m => (
        <option key={m.id} value={m.id}>{m.name}</option>
      ))}
    </select>
  )
}

function MarketTitle({ marketId }) {
  const { data } = useFilters()
  if (!marketId) return 'Barcha Bozorlar'
  const market = data?.markets?.find(m => m.id === marketId)
  return market?.name || 'Bozor'
}
