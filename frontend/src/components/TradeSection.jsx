import React, { useState } from 'react'
import { Store, ShoppingBag, Tent } from 'lucide-react'
import StatCard, { fmt, fmtSum } from './StatCard'
import { useShops, useStalls, useOpenTrade } from '../hooks/useDashboard'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const TABS = [
  { id: 'shops',     label: 'Magazinlar',   icon: <Store size={15} /> },
  { id: 'stalls',    label: 'Rastalar',     icon: <ShoppingBag size={15} /> },
  { id: 'openTrade', label: 'Ochiq Savdo',  icon: <Tent size={15} /> },
]

const COLORS = ['#2563eb', '#f59e0b']

function TabContent({ tab, filters }) {
  const shops     = useShops(filters)
  const stalls    = useStalls(filters)
  const openTrade = useOpenTrade(filters)

  const queries = { shops, stalls, openTrade }
  const { data, isLoading } = queries[tab]
  const d = data || {}

  let cards = []
  let pieData = []

  if (tab === 'shops') {
    cards = [
      { label: 'Jami Magazinlar', value: fmt(d.total_shops), color: 'primary' },
      { label: 'Aktiv', value: fmt(d.active_shops), color: 'success', sub: `Nofaol: ${fmt(d.inactive_shops)}` },
      { label: 'Daromad', value: fmtSum(d.shop_revenue), sub: 'UZS', color: 'success' },
      { label: 'Qarz', value: fmtSum(d.shop_debt_amount), sub: `Qarzdorlar: ${fmt(d.shop_debtors_count)}`, color: 'error' },
    ]
    pieData = [
      { name: 'Aktiv', value: d.active_shops || 0 },
      { name: 'Nofaol', value: d.inactive_shops || 0 },
    ]
  } else if (tab === 'stalls') {
    cards = [
      { label: 'Jami Rastalar', value: fmt(d.total_stalls), color: 'secondary' },
      { label: 'Aktiv', value: fmt(d.active_stalls), color: 'success', sub: `Nofaol: ${fmt(d.inactive_stalls)}` },
      { label: 'Daromad', value: fmtSum(d.stall_revenue), sub: 'UZS', color: 'success' },
      { label: 'Qarz', value: fmtSum(d.stall_debt_amount), sub: `Qarzdorlar: ${fmt(d.stall_debtors_count)}`, color: 'error' },
    ]
    pieData = [
      { name: 'Aktiv', value: d.active_stalls || 0 },
      { name: 'Nofaol', value: d.inactive_stalls || 0 },
    ]
  } else {
    cards = [
      { label: 'Jami Ochiq Joylar', value: fmt(d.total_open_trade_places), color: 'accent' },
      { label: 'Aktiv', value: fmt(d.active_open_trade_places), color: 'success', sub: `Nofaol: ${fmt(d.inactive_open_trade_places)}` },
      { label: 'Daromad', value: fmtSum(d.open_trade_revenue), sub: 'UZS', color: 'success' },
      { label: 'Qarz', value: fmtSum(d.open_trade_debt_amount), sub: `Qarzdorlar: ${fmt(d.open_trade_debtors_count)}`, color: 'error' },
    ]
    pieData = [
      { name: 'Aktiv', value: d.active_open_trade_places || 0 },
      { name: 'Nofaol', value: d.inactive_open_trade_places || 0 },
    ]
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="grid grid-cols-2 gap-4 flex-1">
        {cards.map(c => <StatCard key={c.label} {...c} loading={isLoading} />)}
      </div>
      <div className="card bg-base-100 shadow-sm border border-base-200 p-4 w-full lg:w-64 flex items-center justify-center">
        {isLoading ? (
          <div className="skeleton h-48 w-48 rounded-full" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                paddingAngle={4} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#2563eb' : '#f59e0b'} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => fmt(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

export default function TradeSection({ filters }) {
  const [activeTab, setActiveTab] = useState('shops')

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <Store size={20} className="text-primary" />
        <h2 className="text-lg font-semibold text-neutral">Savdo Joylari</h2>
        <div role="tablist" className="tabs tabs-boxed ml-auto bg-base-200">
          {TABS.map(t => (
            <button
              key={t.id}
              role="tab"
              className={`tab gap-1.5 text-sm ${activeTab === t.id ? 'tab-active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>
      <TabContent tab={activeTab} filters={filters} />
    </section>
  )
}
