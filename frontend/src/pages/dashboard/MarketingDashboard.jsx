import { useEffect, useState } from 'react'
import api from '../../api/axios'
import StatTile from '../../components/dashboard/StatTile'
import Panel from '../../components/dashboard/Panel'
import { D3DonutChart, D3BarChart } from '../../components/reports/D3Charts'

// Shared by marketing_manager and marketing_executive. There's no Campaign/ad-spend
// model in this codebase yet, so CPL/spend/ROI aren't shown — everything here is
// derived from real Lead.source data (see plan doc for the follow-up to add a
// real campaign model).
export default function MarketingDashboard() {
  const [leads, setLeads] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/leads'), api.get('/deals')])
      .then(([lRes, dRes]) => {
        setLeads(lRes.data)
        setDeals(dRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const siteVisits = leads.reduce(
    (count, l) => count + (l.followUpTasks || []).filter((t) => t.type === 'Site Visit').length,
    0
  )
  const wonDeals = deals.filter((d) => d.stage === 'Won')
  const conversionRate = leads.length ? ((wonDeals.length / leads.length) * 100).toFixed(1) : '0.0'

  const bySource = Object.entries(
    leads.reduce((acc, l) => {
      acc[l.source] = (acc[l.source] || 0) + 1
      return acc
    }, {})
  ).map(([source, count]) => ({ source, count }))

  const sourceConversion = Object.entries(
    leads.reduce((acc, l) => {
      acc[l.source] = acc[l.source] || { source: l.source, leads: 0, won: 0 }
      acc[l.source].leads += 1
      if (deals.some((d) => d.lead?._id === l._id && d.stage === 'Won')) acc[l.source].won += 1
      return acc
    }, {})
  ).map(([, v]) => v)

  return (
    <div className="p-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatTile icon="👥" label="Leads Generated" val={leads.length} color="bg-blue-50 text-blue-600" loading={loading} link="/leads" />
        <StatTile icon="🏠" label="Site Visits" val={siteVisits} color="bg-green-50 text-green-600" loading={loading} link="/visits/calendar" />
        <StatTile icon="📦" label="Bookings" val={wonDeals.length} color="bg-yellow-50 text-yellow-600" loading={loading} link="/deals" />
        <StatTile icon="📈" label="Conversion" val={`${conversionRate}%`} color="bg-purple-50 text-purple-600" loading={loading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {!loading && bySource.length > 0 && (
          <D3DonutChart title="📢 Lead Sources" subtitle="Where leads are coming from" data={bySource} labelKey="source" valueKey="count" />
        )}
        {!loading && sourceConversion.length > 0 && (
          <D3BarChart title="🎯 Bookings by Source" subtitle="Won deals per lead source" data={sourceConversion} xKey="source" yKey="won" color="#16a34a" />
        )}
      </div>

      <Panel title="📢 Campaign Performance" loading={false}>
        <p className="text-sm text-gray-500">
          Campaign-level spend, CPL, and channel ROI aren't tracked yet — this needs a real Campaign model.
          The numbers above are derived from lead source data instead.
        </p>
      </Panel>
    </div>
  )
}
