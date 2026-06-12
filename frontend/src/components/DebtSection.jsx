import React from 'react'
import { AlertCircle } from 'lucide-react'
import StatCard, { fmt, fmtSum } from './StatCard'
import { useDebts } from '../hooks/useDashboard'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts'

const COLORS = ['#2563eb', '#7c3aed', '#0891b2']

export default function DebtSection({ filters }) {
  const { data, isLoading } = useDebts(filters)
  const d = data || {}

  const chartData = [
    { name: 'Magazinlar', qarz: d.shop_debt_amount || 0, qarzdorlar: d.shop_debtors_count || 0 },
    { name: 'Rastalar',   qarz: d.stall_debt_amount || 0, qarzdorlar: d.stall_debtors_count || 0 },
    { name: 'Ochiq Savdo', qarz: d.open_trade_debt_amount || 0, qarzdorlar: d.open_trade_debtors_count || 0 },
  ]

  const summary = [
    { label: 'Umumiy Qarz', value: fmtSum(d.total_debt_amount), sub: 'UZS', color: 'error' },
    { label: 'Jami Qarzdorlar', value: fmt(d.total_debtors_count), sub: 'kishi', color: 'warning' },
    { label: 'Magazin Qarzi', value: fmtSum(d.shop_debt_amount), sub: `${fmt(d.shop_debtors_count)} kishi`, color: 'primary' },
    { label: 'Rasta Qarzi', value: fmtSum(d.stall_debt_amount), sub: `${fmt(d.stall_debtors_count)} kishi`, color: 'secondary' },
    { label: 'Ochiq Savdo Qarzi', value: fmtSum(d.open_trade_debt_amount), sub: `${fmt(d.open_trade_debtors_count)} kishi`, color: 'accent' },
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-base-100 border border-base-200 rounded-xl shadow-lg p-3 text-sm">
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>
              {p.name === 'qarz' ? 'Qarz: ' : 'Qarzdorlar: '}
              <span className="font-medium">
                {p.name === 'qarz' ? fmtSum(p.value) : fmt(p.value)}
              </span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <section>
      <h2 className="section-title">
        <AlertCircle size={20} className="text-error" />
        Qarz Tahlili
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {summary.map(c => (
          <StatCard key={c.label} {...c} loading={isLoading} />
        ))}
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200 p-5">
        <p className="text-sm font-semibold text-base-content mb-4">Qarz taqsimoti (UZS)</p>
        {isLoading ? (
          <div className="skeleton h-48 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barSize={40}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => fmtSum(v)} tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="qarz" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}
