import React from 'react'
import { Car, DollarSign, Hash } from 'lucide-react'
import StatCard, { fmt, fmtSum } from './StatCard'
import { useVehicleEntries } from '../hooks/useDashboard'

export default function VehicleSection({ filters }) {
  const { data, isLoading } = useVehicleEntries(filters)
  const d = data || {}

  const cards = [
    {
      icon: <Car size={20} />,
      label: 'Kirgan Transportlar',
      value: fmt(d.vehicle_entries_count),
      sub: 'Jami kirish soni',
      color: 'accent',
    },
    {
      icon: <DollarSign size={20} />,
      label: 'Transport Daromadi',
      value: fmtSum(d.vehicle_entries_revenue),
      sub: 'UZS',
      color: 'success',
    },
    {
      icon: <Hash size={20} />,
      label: "O'rtacha To'lov",
      value: fmtSum(d.average_vehicle_entry_fee),
      sub: 'UZS / kirish',
      color: 'info',
    },
  ]

  return (
    <section>
      <h2 className="section-title">
        <Car size={20} className="text-accent" />
        Transport Kirishi
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map(c => (
          <StatCard key={c.label} {...c} loading={isLoading} />
        ))}
      </div>
    </section>
  )
}
