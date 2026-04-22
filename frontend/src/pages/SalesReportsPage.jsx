import { useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { D3BarChart, D3DonutChart, D3LineChart } from '../components/reports/D3Charts'

const SALES_STAGES = [
  'Lead Qualification',
  'Needs Analysis',
  'Proposal Sent',
  'Negotiation',
  'Contract Review',
  'Won',
  'Lost',
]

function formatInr(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-IN')}`
}

function daysFromRange(range) {
  if (range === '30d') return 30
  if (range === '90d') return 90
  return 365
}

function inRange(dateValue, range) {
  if (!dateValue) return false
  const dt = new Date(dateValue)
  if (Number.isNaN(dt.getTime())) return false
  const diff = Date.now() - dt.getTime()
  return diff <= daysFromRange(range) * 24 * 60 * 60 * 1000
}

function monthKey(dateValue) {
  const d = new Date(dateValue)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key) {
  const [y, m] = key.split('-').map(Number)
  const dt = new Date(y, m - 1, 1)
  return dt.toLocaleString('en-US', { month: 'short', year: '2-digit' })
}

export default function SalesReportsPage() {
  const [range, setRange] = useState('90d')
  const [deals, setDeals] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/deals'), api.get('/projects')])
      .then(([dRes, pRes]) => {
        setDeals(Array.isArray(dRes.data) ? dRes.data : [])
        setProjects(Array.isArray(pRes.data) ? pRes.data : [])
      })
      .catch(() => setError('Unable to load sales report data'))
      .finally(() => setLoading(false))
  }, [])

  const filteredDeals = useMemo(() => {
    return deals.filter((d) => inRange(d.createdAt || d.updatedAt || d.closingDate, range))
  }, [deals, range])

  const metrics = useMemo(() => {
    const won = filteredDeals.filter((d) => d.stage === 'Won')
    const lost = filteredDeals.filter((d) => d.stage === 'Lost')
    const active = filteredDeals.filter((d) => !['Won', 'Lost'].includes(d.stage))
    const totalValue = filteredDeals.reduce((sum, d) => sum + Number(d.value || 0), 0)
    const wonValue = won.reduce((sum, d) => sum + Number(d.value || 0), 0)
    const winRate = filteredDeals.length ? ((won.length / filteredDeals.length) * 100) : 0
    return {
      total: filteredDeals.length,
      active: active.length,
      won: won.length,
      lost: lost.length,
      winRate,
      pipelineValue: totalValue,
      wonValue,
    }
  }, [filteredDeals])

  const stageBreakdown = useMemo(() => {
    return SALES_STAGES.map((stage) => ({
      stage,
      count: filteredDeals.filter((d) => d.stage === stage).length,
      value: filteredDeals
        .filter((d) => d.stage === stage)
        .reduce((sum, d) => sum + Number(d.value || 0), 0),
    }))
  }, [filteredDeals])

  const topProjects = useMemo(() => {
    const counts = {}
    for (const d of filteredDeals) {
      const name = d.unit?.project?.name || 'Unknown Project'
      if (!counts[name]) counts[name] = { deals: 0, value: 0 }
      counts[name].deals += 1
      counts[name].value += Number(d.value || 0)
    }
    return Object.entries(counts)
      .map(([name, info]) => ({ name, ...info }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [filteredDeals])

  const monthSeries = useMemo(() => {
    const wonDeals = filteredDeals.filter((d) => d.stage === 'Won')
    const map = {}
    for (const d of wonDeals) {
      const key = monthKey(d.closingDate || d.updatedAt || d.createdAt)
      if (!key) continue
      map[key] = (map[key] || 0) + Number(d.value || 0)
    }
    const keys = Object.keys(map).sort().slice(-6)
    return keys.map((key) => ({ key, label: monthLabel(key), value: map[key] }))
  }, [filteredDeals])

  const stageCountData = stageBreakdown.map((row) => ({ stage: row.stage, count: row.count }))
  const stageValueData = stageBreakdown.map((row) => ({ stage: row.stage, value: row.value }))
  const topProjectData = topProjects.map((p) => ({ project: p.name, value: p.value }))
  const monthRevenueData = monthSeries.map((m) => ({ month: m.label, revenue: m.value }))
  const outcomeData = [
    { label: 'Won', value: metrics.won },
    { label: 'Lost', value: metrics.lost },
    { label: 'Active', value: metrics.active },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Revenue, funnel stage, and project conversion insights.</p>
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
              <p className="text-xs text-gray-500">Deals in Period</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{metrics.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Pipeline Value</p>
              <p className="text-2xl font-bold text-indigo-700 mt-1">{formatInr(metrics.pipelineValue)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Won Value</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{formatInr(metrics.wonValue)}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500">Win Rate</p>
              <p className="text-2xl font-bold text-primary-700 mt-1">{metrics.winRate.toFixed(1)}%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2">
              <D3BarChart
                title="Stage Breakdown by Deal Count"
                subtitle="Pipeline stage volume in selected period"
                data={stageCountData}
                xKey="stage"
                yKey="count"
                color="#2563eb"
              />
            </div>
            <D3DonutChart
              title="Deal Outcome"
              subtitle={`Projects tracked in report: ${projects.length}`}
              data={outcomeData}
              labelKey="label"
              valueKey="value"
              colors={['#16a34a', '#ef4444', '#2563eb']}
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <D3BarChart
              title="Top Projects by Deal Value"
              subtitle="High-value project contribution"
              data={topProjectData}
              xKey="project"
              yKey="value"
              color="#7c3aed"
              formatY={(v) => `Rs ${(Number(v) / 100000).toFixed(1)}L`}
            />

            <D3LineChart
              title="Monthly Won Revenue"
              subtitle="Last 6 months won deal trend"
              data={monthRevenueData}
              xKey="month"
              yKey="revenue"
              color="#16a34a"
              formatY={(v) => `Rs ${(Number(v) / 100000).toFixed(0)}L`}
            />
          </div>

          <D3BarChart
            title="Stage Breakdown by Value"
            subtitle="Deal value distribution across stages"
            data={stageValueData}
            xKey="stage"
            yKey="value"
            color="#f59e0b"
            formatY={(v) => `Rs ${(Number(v) / 100000).toFixed(1)}L`}
          />
        </>
      )}
    </div>
  )
}
