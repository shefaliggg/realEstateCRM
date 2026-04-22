import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { D3BarChart, D3DonutChart, D3StackedBarChart } from '../components/reports/D3Charts'

const STAGES = ['Cold', 'Warm', 'Interested', 'Very Interested', 'Nurtured']
function daysFromRange(range) {
  if (range === '30d') return 30
  if (range === '90d') return 90
  return 365
}

function isInRange(dateValue, range) {
  if (!dateValue) return false
  const dt = new Date(dateValue)
  if (Number.isNaN(dt.getTime())) return false
  const diff = Date.now() - dt.getTime()
  return diff <= daysFromRange(range) * 24 * 60 * 60 * 1000
}

export default function MarketingReportsPage() {
  const [range, setRange] = useState('90d')
  const [leads, setLeads] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/leads'), api.get('/deals')])
      .then(([lRes, dRes]) => {
        setLeads(Array.isArray(lRes.data) ? lRes.data : [])
        setDeals(Array.isArray(dRes.data) ? dRes.data : [])
      })
      .catch(() => setError('Unable to load marketing report data'))
      .finally(() => setLoading(false))
  }, [])

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => isInRange(l.createdAt || l.updatedAt, range))
  }, [leads, range])

  const leadIdWithDeal = useMemo(() => {
    return new Set(deals.map((d) => d.lead?._id).filter(Boolean))
  }, [deals])

  const sourceBreakdown = useMemo(() => {
    const map = {}
    for (const l of filteredLeads) {
      const source = l.source || 'Unknown'
      if (!map[source]) map[source] = { leads: 0, converted: 0 }
      map[source].leads += 1
      if (leadIdWithDeal.has(l._id)) map[source].converted += 1
    }
    return Object.entries(map)
      .map(([source, value]) => ({
        source,
        ...value,
        conversionRate: value.leads ? (value.converted / value.leads) * 100 : 0,
      }))
      .sort((a, b) => b.leads - a.leads)
  }, [filteredLeads, leadIdWithDeal])

  const stageBreakdown = useMemo(() => {
    return STAGES.map((stage) => ({
      stage,
      count: filteredLeads.filter((l) => (l.nurtureStage || 'Cold') === stage).length,
    }))
  }, [filteredLeads])

  const campaignHealth = useMemo(() => {
    const scoreMap = {
      highIntent: filteredLeads.filter((l) => Number(l.leadScore || 0) >= 4).length,
      mediumIntent: filteredLeads.filter((l) => Number(l.leadScore || 0) === 3).length,
      lowIntent: filteredLeads.filter((l) => Number(l.leadScore || 0) <= 2).length,
    }
    const visitsScheduled = filteredLeads.reduce((sum, l) => {
      const count = (l.followUpTasks || []).filter((t) => t.type === 'Site Visit').length
      return sum + count
    }, 0)
    return {
      ...scoreMap,
      visitsScheduled,
      avgScore: filteredLeads.length
        ? filteredLeads.reduce((sum, l) => sum + Number(l.leadScore || 0), 0) / filteredLeads.length
        : 0,
    }
  }, [filteredLeads])

  const totalLeads = filteredLeads.length
  const convertedLeads = filteredLeads.filter((l) => leadIdWithDeal.has(l._id)).length
  const conversionRate = totalLeads ? (convertedLeads / totalLeads) * 100 : 0
  const sourceLeadsData = sourceBreakdown.map((row) => ({ source: row.source, leads: row.leads }))
  const sourceConversionData = sourceBreakdown.map((row) => ({
    source: row.source,
    converted: row.converted,
    notConverted: Math.max(0, row.leads - row.converted),
  }))
  const stageMixData = stageBreakdown.map((row) => ({ stage: row.stage, count: row.count }))
  const campaignDonutData = [
    { label: 'High Intent', value: campaignHealth.highIntent },
    { label: 'Medium Intent', value: campaignHealth.mediumIntent },
    { label: 'Low Intent', value: campaignHealth.lowIntent },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Lead source performance, quality, and conversion analytics.</p>
        </div>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
          <option value="365d">Last 12 months</option>
        </select>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
      {loading && <div className="text-sm text-gray-400">Loading report data...</div>}

      {!loading && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Leads Generated</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{totalLeads}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Converted to Deals</p>
              <p className="text-2xl font-bold text-primary-700 mt-1">{convertedLeads}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{conversionRate.toFixed(1)}%</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Avg Lead Score</p>
              <p className="text-2xl font-bold text-indigo-700 mt-1">{campaignHealth.avgScore.toFixed(2)} / 5</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2">
              <D3BarChart
                title="Lead Source Contribution"
                subtitle="Volume of leads by acquisition channel"
                data={sourceLeadsData}
                xKey="source"
                yKey="leads"
                color="#2563eb"
              />
            </div>
            <D3DonutChart
              title="Campaign Health"
              subtitle={`Site visits scheduled: ${campaignHealth.visitsScheduled}`}
              data={campaignDonutData}
              labelKey="label"
              valueKey="value"
              colors={['#16a34a', '#f59e0b', '#64748b']}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <D3StackedBarChart
              title="Source Conversion Mix"
              subtitle="Converted vs not converted by source"
              data={sourceConversionData}
              xKey="source"
              keys={['converted', 'notConverted']}
              colors={['#16a34a', '#e5e7eb']}
            />

            <D3BarChart
              title="Nurture Stage Mix"
              subtitle="Lead distribution across nurture funnel"
              data={stageMixData}
              xKey="stage"
              yKey="count"
              color="#ec4899"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Source Conversion Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Source</th>
                    <th className="px-3 py-2 text-left font-medium">Leads</th>
                    <th className="px-3 py-2 text-left font-medium">Converted</th>
                    <th className="px-3 py-2 text-left font-medium">Conversion Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {sourceBreakdown.map((row) => (
                    <tr key={row.source}>
                      <td className="px-3 py-2 text-gray-700">{row.source}</td>
                      <td className="px-3 py-2 text-gray-700">{row.leads}</td>
                      <td className="px-3 py-2 text-green-700">{row.converted}</td>
                      <td className="px-3 py-2 text-primary-700 font-medium">{row.conversionRate.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
