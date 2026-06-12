import React, { useState } from 'react'
import { Store, ShoppingBag, Tent } from 'lucide-react'
import StatCard, { fmt, fmtSum } from './StatCard'
import { useShops, useStalls, useOpenTrade } from '../hooks/useDashboard'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const TABS = [
  { id: 'shops',     label: 'Magazinlar',  icon: <Store size={14} /> },
  { id: 'stalls',    label: 'Rastalar',    icon: <ShoppingBag size={14} /> },
  { id: 'openTrade', label: 'Ochiq Savdo', icon: <Tent size={14} /> },
]

function TabContent({ tab, filters }) {
  const shops     = useShops(filters)
  const stalls    = useStalls(filters)
  const openTrade = useOpenTrade(filters)
  const { data, isLoading } = { shops, stalls, openTrade }[tab]
  const d = data || {}

  const cfg = {
    shops: {
      cards: [
        { label: 'Jami Magazinlar',  value: fmt(d.total_shops),        color: 'primary'   },
        { label: 'Aktiv',            value: fmt(d.active_shops),        color: 'success',  sub: `Nofaol: ${fmt(d.inactive_shops)}` },
        { label: 'Daromad',          value: fmtSum(d.shop_revenue),     color: 'success',  sub: 'UZS' },
        { label: 'Qarz',             value: fmtSum(d.shop_debt_amount), color: 'error',    sub: `${fmt(d.shop_debtors_count)} qarzdor` },
      ],
      pie: [{ name: 'Aktiv', value: d.active_shops || 0 }, { name: 'Nofaol', value: d.inactive_shops || 0 }],
    },
    stalls: {
      cards: [
        { label: 'Jami Rastalar',    value: fmt(d.total_stalls),         color: 'secondary' },
        { label: 'Aktiv',            value: fmt(d.active_stalls),        color: 'success',  sub: `Nofaol: ${fmt(d.inactive_stalls)}` },
        { label: 'Daromad',          value: fmtSum(d.stall_revenue),     color: 'success',  sub: 'UZS' },
        { label: 'Qarz',             value: fmtSum(d.stall_debt_amount), color: 'error',    sub: `${fmt(d.stall_debtors_count)} qarzdor` },
      ],
      pie: [{ name: 'Aktiv', value: d.active_stalls || 0 }, { name: 'Nofaol', value: d.inactive_stalls || 0 }],
    },
    openTrade: {
      cards: [
        { label: 'Jami Ochiq Joylar', value: fmt(d.total_open_trade_places),    color: 'accent'  },
        { label: 'Aktiv',             value: fmt(d.active_open_trade_places),   color: 'success', sub: `Nofaol: ${fmt(d.inactive_open_trade_places)}` },
        { label: 'Daromad',           value: fmtSum(d.open_trade_revenue),      color: 'success', sub: 'UZS' },
        { label: 'Qarz',              value: fmtSum(d.open_trade_debt_amount),  color: 'error',   sub: `${fmt(d.open_trade_debtors_count)} qarzdor` },
      ],
      pie: [
        { name: 'Aktiv',   value: d.active_open_trade_places   || 0 },
        { name: 'Nofaol',  value: d.inactive_open_trade_places || 0 },
      ],
    },
  }[tab]

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="grid grid-cols-2 gap-4 flex-1">
        {cfg.cards.map(c => <StatCard key={c.label} {...c} loading={isLoading} />)}
      </div>
      <div className="card bg-base-100 shadow-sm border border-base-200 p-4
                      w-full lg:w-60 flex items-center justify-center">
        {isLoading
          ? <div className="skeleton h-44 w-44 rounded-full" />
          : (
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie data={cfg.pie} cx="50%" cy="50%" innerRadius={52} outerRadius={82}
                     paddingAngle={4} dataKey="value">
                  <Cell fill="#2563eb" />
                  <Cell fill="#f59e0b" />
                </Pie>
                <Tooltip formatter={v => fmt(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )
        }
      </div>
    </div>
  )
}

export default function TradeSection({ filters }) {
  const [tab, setTab] = useState('shops')
  return (
    <section>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Store size={20} className="text-primary" />
        <h2 className="text-lg font-semibold text-base-content">Savdo Joylari</h2>
        <div role="tablist" className="tabs tabs-boxed ml-auto bg-base-200">
          {TABS.map(t => (
            <button key={t.id} role="tab"
              className={`tab gap-1.5 text-sm ${tab === t.id ? 'tab-active' : ''}`}
              onClick={() => setTab(t.id)}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>
      </div>
      <TabContent tab={tab} filters={filters} />
    </section>
  )
}
