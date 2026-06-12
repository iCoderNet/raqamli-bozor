import React, { useState } from 'react'
import { AlertCircle, Phone, ChevronUp, ChevronDown } from 'lucide-react'
import { useTopDebtors } from '../hooks/useDashboard'
import { fmtSum, fmt } from './StatCard'

const TYPE_LABEL = {
  shop:       { label: 'Magazin',     cls: 'badge-primary'   },
  stall:      { label: 'Rasta',       cls: 'badge-secondary' },
  open_trade: { label: 'Ochiq Savdo', cls: 'badge-accent'    },
}

export default function TopDebtorsTable({ filters }) {
  const [limit,     setLimit]     = useState(10)
  const [sortField, setSortField] = useState('debt_amount')
  const [sortDir,   setSortDir]   = useState('desc')

  const { data, isLoading } = useTopDebtors({ ...filters, limit })
  const results = data?.results || []

  const sorted = [...results].sort((a, b) => {
    const v = sortDir === 'asc' ? 1 : -1
    if (typeof a[sortField] === 'number') return (a[sortField] - b[sortField]) * v
    return String(a[sortField]).localeCompare(String(b[sortField])) * v
  })

  function handleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  function SortIcon({ field }) {
    if (sortField !== field) return <ChevronUp size={12} className="opacity-30" />
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-primary" />
      : <ChevronDown size={12} className="text-primary" />
  }

  return (
    <section>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <AlertCircle size={20} className="text-error" />
        <h2 className="text-lg font-semibold text-base-content">Top Qarzdorlar</h2>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-xs text-base-content/50">Ko'rsatish:</span>
          {[10, 20, 50].map(n => (
            <button key={n} onClick={() => setLimit(n)}
              className={`btn btn-xs ${limit === n ? 'btn-primary' : 'btn-ghost'}`}>
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead className="bg-base-200 text-base-content/60">
              <tr>
                <th className="w-8">#</th>
                <th>Tur</th>
                <th className="cursor-pointer hover:text-primary select-none" onClick={() => handleSort('name')}>
                  <span className="flex items-center gap-1">Nomi <SortIcon field="name" /></span>
                </th>
                <th className="cursor-pointer hover:text-primary select-none" onClick={() => handleSort('owner_name')}>
                  <span className="flex items-center gap-1">Egasi <SortIcon field="owner_name" /></span>
                </th>
                <th>Telefon</th>
                <th className="cursor-pointer hover:text-primary select-none text-right" onClick={() => handleSort('debt_amount')}>
                  <span className="flex items-center justify-end gap-1">Qarz (UZS) <SortIcon field="debt_amount" /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{[...Array(6)].map((_, j) => (
                      <td key={j}><div className="skeleton h-4 w-full" /></td>
                    ))}</tr>
                  ))
                : sorted.length === 0
                ? <tr><td colSpan={6} className="text-center py-10 text-base-content/40">Qarzdorlar mavjud emas</td></tr>
                : sorted.map((item, idx) => {
                    const t = TYPE_LABEL[item.type] || { label: item.type, cls: 'badge-neutral' }
                    const cls = item.debt_amount > 5_000_000 ? 'text-error font-bold'
                              : item.debt_amount > 2_000_000 ? 'text-warning font-semibold'
                              : 'text-base-content'
                    return (
                      <tr key={idx} className="hover:bg-base-200/50">
                        <td className="text-base-content/40 font-mono text-xs">{idx + 1}</td>
                        <td><span className={`badge badge-sm ${t.cls}`}>{t.label}</span></td>
                        <td className="font-medium text-base-content">{item.name}</td>
                        <td className="text-base-content/70">{item.owner_name}</td>
                        <td>
                          {item.phone
                            ? <a href={`tel:${item.phone}`} className="flex items-center gap-1 text-primary hover:underline text-xs">
                                <Phone size={11} /> {item.phone}
                              </a>
                            : <span className="text-base-content/30 text-xs">—</span>
                          }
                        </td>
                        <td className={`text-right tabular-nums ${cls}`}>{fmtSum(item.debt_amount)}</td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>
        {results.length > 0 && (
          <div className="px-4 py-2 border-t border-base-200 text-xs text-base-content/40 flex justify-between">
            <span>Jami: {data?.count ?? results.length} ta</span>
            <span>Ko'rsatilgan: {sorted.length}</span>
          </div>
        )}
      </div>
    </section>
  )
}
