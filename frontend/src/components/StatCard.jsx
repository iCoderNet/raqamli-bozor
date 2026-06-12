import React from 'react'

// Format big numbers with spaces
export function fmt(val) {
  if (val === undefined || val === null) return '—'
  if (typeof val === 'number') {
    return val.toLocaleString('uz-UZ')
  }
  return val
}

export function fmtSum(val) {
  if (val === undefined || val === null) return '—'
  const n = Number(val)
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + ' mlrd'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + ' mln'
  return n.toLocaleString('uz-UZ')
}

export default function StatCard({ icon, label, value, sub, color = 'primary', loading }) {
  const colorMap = {
    primary:   'text-primary   bg-primary/10',
    success:   'text-success   bg-success/10',
    warning:   'text-warning   bg-warning/10',
    error:     'text-error     bg-error/10',
    secondary: 'text-secondary bg-secondary/10',
    accent:    'text-accent    bg-accent/10',
    info:      'text-info      bg-info/10',
  }
  const cls = colorMap[color] || colorMap.primary

  return (
    <div className="stat-card">
      <div className="card-body p-5">
        {loading ? (
          <div className="flex flex-col gap-3">
            <div className="skeleton h-10 w-10 rounded-xl" />
            <div className="skeleton h-4 w-24" />
            <div className="skeleton h-7 w-32" />
          </div>
        ) : (
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-base-content/60 uppercase tracking-wide truncate">{label}</p>
              <p className="text-2xl font-bold text-neutral mt-1 animate-count">{value}</p>
              {sub && <p className="text-xs text-base-content/50 mt-0.5">{sub}</p>}
            </div>
            <div className={`rounded-xl p-2.5 flex-shrink-0 ${cls}`}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
