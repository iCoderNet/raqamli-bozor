import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ShieldCheck, Search, LayoutDashboard, LogOut,
  ToggleLeft, ToggleRight, Loader2, AlertCircle,
  CheckCircle2, XCircle, BarChart3, Sun, Moon,
} from 'lucide-react'
import { adminApi } from '../api/client'

// ─── Filter constants ───────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: 'all',      label: 'Barchasi'    },
  { value: 'enabled',  label: 'Yoqilganlar' },
  { value: 'disabled', label: "O'chirilganlar" },
]

// ═══════════════════════════════════════════════════════════════════════════
export default function SuperadminPage({ user, onGoToDashboard, onLogout, theme, onToggleTheme }) {
  const qc = useQueryClient()

  const [search,     setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pendingId,  setPendingId]  = useState(null)

  // ─── Data ────────────────────────────────────────────────────────────────
  const { data: markets = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['adminMarkets'],
    queryFn:  adminApi.getMarkets,
    staleTime: 0,
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isEnabled }) => adminApi.toggleMarket(String(id), isEnabled),
    onMutate:   ({ id }) => setPendingId(String(id)),
    onSettled:  ()       => setPendingId(null),
    onSuccess:  ()       => {
      qc.invalidateQueries({ queryKey: ['adminMarkets'] })
      qc.invalidateQueries({ queryKey: ['filters'] })
    },
  })

  // ─── Stats ───────────────────────────────────────────────────────────────
  const totalCount    = markets.length
  const enabledCount  = markets.filter(m => m.is_enabled).length
  const disabledCount = totalCount - enabledCount

  // ─── Filtered list (inline — har render da qayta hisoblanadi) ───────────
  const q = search.trim().toLowerCase()
  const filtered = markets.filter(m => {
    const enabled = Boolean(m.is_enabled)
    if (statusFilter === 'enabled'  && !enabled) return false
    if (statusFilter === 'disabled' &&  enabled) return false
    if (q) {
      const nameMatch = (m.name ?? '').toLowerCase().includes(q)
      const idMatch   = String(m.id ?? m.tin ?? '').toLowerCase().includes(q)
      if (!nameMatch && !idMatch) return false
    }
    return true
  })

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-base-200/40 flex flex-col">

      {/* ── Navbar ── */}
      <header className="navbar bg-base-100 border-b border-base-200 px-4 md:px-8 sticky top-0 z-30 shadow-sm">

        {/* Logo */}
        <div className="navbar-start gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary
                            flex items-center justify-center shadow-sm flex-shrink-0">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-base-content leading-tight">Superadmin</p>
              <p className="text-xs text-base-content/50 leading-tight">Bozorlar boshqaruvi</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="navbar-end flex items-center gap-1.5">

          {/* Dashboard link */}
          <button
            onClick={onGoToDashboard}
            className="btn btn-outline btn-primary btn-sm gap-2"
          >
            <LayoutDashboard size={14} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>

          {/* Theme */}
          <button
            onClick={onToggleTheme}
            className="btn btn-ghost btn-sm btn-square"
            title="Tema"
          >
            {theme === 'raqamli' ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {/* User menu */}
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="btn btn-ghost btn-sm gap-2 pl-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                <ShieldCheck size={13} className="text-primary" />
              </div>
              <span className="hidden md:inline text-sm font-medium">
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
                <button onClick={onLogout} className="text-error hover:bg-error/10 gap-2">
                  <LogOut size={14} /> Chiqish
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 px-4 md:px-8 py-8 max-w-screen-lg mx-auto w-full flex flex-col gap-6">

        {/* Page title */}
        <div>
          <h1 className="text-2xl font-bold text-base-content">Bozorlar Boshqaruvi</h1>
          <p className="text-sm text-base-content/50 mt-0.5">
            Bozorni yoqish yoki o'chirish — o'chirilgan bozorlar foydalanuvchilarga ko'rinmaydi
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Jami bozorlar"
            value={isLoading ? '—' : totalCount}
            icon={<BarChart3 size={18} />}
            color="text-base-content"
            bg="bg-base-100"
          />
          <StatCard
            label="Yoqilgan"
            value={isLoading ? '—' : enabledCount}
            icon={<CheckCircle2 size={18} />}
            color="text-success"
            bg="bg-success/10"
          />
          <StatCard
            label="O'chirilgan"
            value={isLoading ? '—' : disabledCount}
            icon={<XCircle size={18} />}
            color="text-error"
            bg="bg-error/10"
          />
        </div>

        {/* ── Search & Filter bar ── */}
        <div className="flex flex-col sm:flex-row gap-3">

          {/* Search input */}
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              className="input input-bordered w-full pl-9 input-sm h-10 text-sm"
              placeholder="Bozor nomi yoki ID bo'yicha qidirish..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Status filter */}
          <div className="flex gap-1 bg-base-200 rounded-xl p-1 flex-shrink-0">
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={`btn btn-xs px-3 rounded-lg transition-all
                  ${statusFilter === opt.value
                    ? 'btn-primary shadow-sm'
                    : 'btn-ghost text-base-content/60 hover:text-base-content'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Results count ── */}
        {!isLoading && !isError && (
          <p className="text-xs text-base-content/40 -mt-2">
            {filtered.length} ta natija
            {search && ` — "${search}" uchun`}
          </p>
        )}

        {/* ── Table ── */}
        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 overflow-hidden">

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-base-content/40">
              <Loader2 size={30} className="animate-spin" />
              <p className="text-sm">Bozorlar yuklanmoqda...</p>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <AlertCircle size={30} className="text-error" />
              <p className="text-sm text-error font-medium">Ma'lumot yuklanmadi</p>
              <button onClick={() => refetch()} className="btn btn-sm btn-outline btn-error">
                Qayta urinish
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-base-content/40">
              <Search size={28} />
              <p className="text-sm">Hech narsa topilmadi</p>
            </div>
          )}

          {/* Table */}
          {!isLoading && !isError && filtered.length > 0 && (
            <table className="table table-sm w-full">
              <thead>
                <tr className="border-b border-base-200 bg-base-200/40">
                  <th className="w-12 text-center text-xs font-semibold text-base-content/50 py-3">#</th>
                  <th className="text-xs font-semibold text-base-content/50 py-3">Bozor nomi</th>
                  <th className="hidden md:table-cell text-xs font-semibold text-base-content/50 py-3">ID</th>
                  <th className="text-xs font-semibold text-base-content/50 py-3 text-center">Holat</th>
                  <th className="text-xs font-semibold text-base-content/50 py-3 text-right pr-4">Amal</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((market, idx) => {
                  const id      = String(market.id ?? market.tin ?? '')
                  const loading = pendingId === id

                  return (
                    <tr
                      key={id}
                      className={`border-b border-base-200/60 transition-colors
                        ${market.is_enabled
                          ? 'hover:bg-base-200/30'
                          : 'opacity-55 hover:opacity-70 hover:bg-base-200/20'}`}
                    >
                      {/* № */}
                      <td className="text-center text-xs text-base-content/40 py-3.5">
                        {idx + 1}
                      </td>

                      {/* Name */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0
                            ${market.is_enabled ? 'bg-success' : 'bg-error'}`} />
                          <span className="text-sm font-medium text-base-content">
                            {market.name}
                          </span>
                        </div>
                      </td>

                      {/* ID */}
                      <td className="hidden md:table-cell py-3.5">
                        <span className="font-mono text-xs text-base-content/40 bg-base-200 px-2 py-0.5 rounded">
                          {id}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="py-3.5 text-center">
                        <span className={`badge badge-sm
                          ${market.is_enabled ? 'badge-success' : 'badge-error'}`}>
                          {market.is_enabled ? 'Yoqiq' : "O'chiq"}
                        </span>
                      </td>

                      {/* Toggle button */}
                      <td className="py-3.5 text-right pr-4">
                        <button
                          className={`btn btn-sm gap-1.5 min-w-[110px]
                            ${market.is_enabled
                              ? 'btn-outline btn-error'
                              : 'btn-outline btn-success'}`}
                          onClick={() => toggleMutation.mutate({ id, isEnabled: !market.is_enabled })}
                          disabled={!!pendingId}
                        >
                          {loading
                            ? <Loader2 size={13} className="animate-spin" />
                            : market.is_enabled
                              ? <><ToggleLeft  size={14} /> O'chirish</>
                              : <><ToggleRight size={14} /> Yoqish</>
                          }
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <footer className="text-center text-xs text-base-content/30 pb-4">
          © {new Date().getFullYear()} Raqamli Bozor — Andijon viloyati
        </footer>
      </main>
    </div>
  )
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color, bg }) {
  return (
    <div className={`${bg} rounded-2xl border border-base-200 px-5 py-4 flex items-center gap-4`}>
      <div className={`${color} opacity-80`}>{icon}</div>
      <div>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-base-content/50 mt-0.5">{label}</p>
      </div>
    </div>
  )
}
