import React, { useState } from 'react'
import { RefreshCw, BarChart3, ChevronDown, Sun, Moon } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { useFilters, useOverview } from './hooks/useDashboard'
import OverviewSection   from './components/OverviewSection'
import TradeSection      from './components/TradeSection'
import DebtSection       from './components/DebtSection'
import VehicleSection    from './components/VehicleSection'
import TopDebtorsTable   from './components/TopDebtorsTable'
import AgentChat         from './components/AgentChat'

const MONTHS = [
  '', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
]

const now = dayjs()
const YEARS = [now.year() - 1, now.year(), now.year() + 1]

export default function App() {
  const qc = useQueryClient()

  const [marketId, setMarketId] = useState(null)
  const [year,     setYear]     = useState(now.year())
  const [month,    setMonth]    = useState(now.month() + 1)
  const [theme,    setTheme]    = useState('raqamli')

  const filters = { marketId, year, month }

  const { data: filtersData, isLoading: filtersLoading } = useFilters()
  const { data: overviewData, isLoading: overviewLoading } = useOverview(filters)

  const markets = filtersData?.markets || []
  const selectedMarket = markets.find(m => m.id === marketId)

  function toggleTheme() {
    const next = theme === 'raqamli' ? 'dark' : 'raqamli'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
  }

  function refresh() {
    qc.invalidateQueries()
  }

  // Build context for AI agent
  const agentContext = overviewData
    ? {
        bozor: selectedMarket?.name || 'Barcha bozorlar',
        yil: year, oy: MONTHS[month] || month,
        ...overviewData
      }
    : null

  return (
    <div className="min-h-screen bg-base-100">
      {/* ─── Navbar ─── */}
      <div className="navbar bg-base-100 border-b border-base-200 px-4 md:px-6 sticky top-0 z-30 shadow-sm">
        {/* Logo */}
        <div className="navbar-start gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary
                            flex items-center justify-center shadow-sm">
              <BarChart3 size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-neutral leading-tight">Raqamli Bozor</p>
              <p className="text-xs text-base-content/50 leading-tight">Dashboard</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="navbar-end flex items-center gap-2 flex-wrap justify-end">
          {/* Year select */}
          <select
            className="select select-bordered select-sm"
            value={year}
            onChange={e => setYear(Number(e.target.value))}
          >
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Month select */}
          <select
            className="select select-bordered select-sm"
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
          >
            {MONTHS.slice(1).map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>

          {/* Market select */}
          <div className="relative">
            <select
              className="select select-bordered select-sm min-w-40 font-medium"
              value={marketId ?? ''}
              onChange={e => setMarketId(e.target.value ? Number(e.target.value) : null)}
              disabled={filtersLoading}
            >
              <option value="">🏪 Barcha bozorlar</option>
              {markets.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <button
            onClick={refresh}
            className="btn btn-ghost btn-sm btn-square"
            title="Yangilash"
          >
            <RefreshCw size={15} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm btn-square"
            title="Tema o'zgartirish"
          >
            {theme === 'raqamli' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <main className="px-4 md:px-6 py-6 max-w-screen-xl mx-auto flex flex-col gap-8">

        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral">
              {selectedMarket ? selectedMarket.name : 'Barcha Bozorlar'}
            </h1>
            <p className="text-sm text-base-content/50 mt-0.5">
              {MONTHS[month]} {year} — Statistik ko'rsatkichlar
            </p>
          </div>
          {overviewLoading && (
            <span className="loading loading-spinner loading-sm text-primary" />
          )}
        </div>

        {/* Sections */}
        <OverviewSection  filters={filters} />
        <TradeSection     filters={filters} />
        <DebtSection      filters={filters} />
        <VehicleSection   filters={filters} />
        <TopDebtorsTable  filters={filters} />

        {/* Footer */}
        <footer className="text-center text-xs text-base-content/30 pb-4">
          © {now.year()} Raqamli Bozor — Andijon viloyati
        </footer>
      </main>

      {/* ─── AI Agent ─── */}
      <AgentChat dashboardContext={agentContext} />
    </div>
  )
}
