import React from 'react'
import { Store, ShoppingBag, Tent, TrendingUp, AlertCircle, Car, Users } from 'lucide-react'
import StatCard, { fmt, fmtSum } from './StatCard'
import { useOverview, useShops, useStalls, useOpenTrade } from '../hooks/useDashboard'

export default function OverviewSection({ filters }) {
  const { data: ov,  isLoading: loadOv } = useOverview(filters)
  // "Jami Savdo Joylari" — use filtered data so it changes per market
  const { data: sh,  isLoading: loadSh } = useShops(filters)
  const { data: st,  isLoading: loadSt } = useStalls(filters)
  const { data: ot,  isLoading: loadOt } = useOpenTrade(filters)

  const o = ov || {}
  const loading = loadOv || loadSh || loadSt || loadOt

  // Totals from filtered endpoints
  const totalPlaces  = (sh?.total_shops || 0) + (st?.total_stalls || 0) + (ot?.total_open_trade_places || 0)
  const activePlaces = (sh?.active_shops || 0) + (st?.active_stalls || 0) + (ot?.active_open_trade_places || 0)

  const cards = [
    {
      icon:  <Store size={20} />,
      label: 'Jami Savdo Joylari',
      value: fmt(totalPlaces),
      sub:   `Aktiv: ${fmt(activePlaces)}`,
      color: 'primary',
    },
    {
      icon:  <TrendingUp size={20} />,
      label: 'Umumiy Daromad',
      value: fmtSum(o.total_revenue),
      sub:   'UZS',
      color: 'success',
    },
    {
      icon:  <AlertCircle size={20} />,
      label: 'Umumiy Qarz',
      value: fmtSum(o.total_debt_amount),
      sub:   `Qarzdorlar: ${fmt(o.debtors_count)}`,
      color: 'error',
    },
    {
      icon:  <Car size={20} />,
      label: 'Transport Kirish',
      value: fmt(o.vehicle_entries_count),
      sub:   `Daromad: ${fmtSum(o.vehicle_entries_revenue)}`,
      color: 'accent',
    },
    {
      icon:  <Store size={20} />,
      label: 'Magazinlar',
      value: fmt(sh?.total_shops),
      sub:   `Aktiv: ${fmt(sh?.active_shops)}`,
      color: 'primary',
    },
    {
      icon:  <ShoppingBag size={20} />,
      label: 'Rastalar',
      value: fmt(st?.total_stalls),
      sub:   `Aktiv: ${fmt(st?.active_stalls)}`,
      color: 'secondary',
    },
    {
      icon:  <Tent size={20} />,
      label: 'Ochiq Savdo',
      value: fmt(ot?.total_open_trade_places),
      sub:   `Aktiv: ${fmt(ot?.active_open_trade_places)}`,
      color: 'accent',
    },
    {
      icon:  <Users size={20} />,
      label: 'Qarzdorlar Soni',
      value: fmt(o.debtors_count),
      sub:   'Jami qarzdorlar',
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
        {cards.map(c => (
          <StatCard key={c.label} {...c} loading={loading} />
        ))}
      </div>
    </section>
  )
}
