import React from 'react'
import {
  Store, ShoppingBag, Tent, TrendingUp, AlertCircle, Car, Users
} from 'lucide-react'
import StatCard, { fmt, fmtSum } from './StatCard'
import { useOverview } from '../hooks/useDashboard'

export default function OverviewSection({ filters }) {
  const { data, isLoading } = useOverview(filters)
  const d = data || {}

  const cards = [
    {
      icon: <Store size={20} />,
      label: 'Jami Savdo Joylari',
      value: fmt((d.total_shops || 0) + (d.total_stalls || 0) + (d.total_open_trade_places || 0)),
      sub: `Aktiv: ${fmt((d.active_shops||0) + (d.active_stalls||0) + (d.active_open_trade_places||0))}`,
      color: 'primary',
    },
    {
      icon: <TrendingUp size={20} />,
      label: 'Umumiy Daromad',
      value: fmtSum(d.total_revenue),
      sub: 'UZS',
      color: 'success',
    },
    {
      icon: <AlertCircle size={20} />,
      label: 'Umumiy Qarz',
      value: fmtSum(d.total_debt_amount),
      sub: `Qarzdorlar: ${fmt(d.debtors_count)}`,
      color: 'error',
    },
    {
      icon: <Car size={20} />,
      label: 'Transport Kirish',
      value: fmt(d.vehicle_entries_count),
      sub: `Daromad: ${fmtSum(d.vehicle_entries_revenue)}`,
      color: 'accent',
    },
    {
      icon: <Store size={20} />,
      label: 'Magazinlar',
      value: fmt(d.total_shops),
      sub: `Aktiv: ${fmt(d.active_shops)}`,
      color: 'primary',
    },
    {
      icon: <ShoppingBag size={20} />,
      label: 'Rastalar',
      value: fmt(d.total_stalls),
      sub: `Aktiv: ${fmt(d.active_stalls)}`,
      color: 'secondary',
    },
    {
      icon: <Tent size={20} />,
      label: 'Ochiq Savdo',
      value: fmt(d.total_open_trade_places),
      sub: `Aktiv: ${fmt(d.active_open_trade_places)}`,
      color: 'accent',
    },
    {
      icon: <Users size={20} />,
      label: 'Qarzdorlar Soni',
      value: fmt(d.debtors_count),
      sub: 'Jami qarzdorlar',
      color: 'warning',
    },
  ]

  return (
    <section>
      <h2 className="section-title">
        <TrendingUp size={20} className="text-primary" />
        Umumiy Ko'rsatkichlar
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} loading={isLoading} />
        ))}
      </div>
    </section>
  )
}
