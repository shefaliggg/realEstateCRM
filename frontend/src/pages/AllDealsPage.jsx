import { useState } from 'react'
import { Link } from 'react-router-dom'

const MOCK_DEALS = [
  {
    id: 1,
    name: 'Skyline Residency - 2BHK Apartment',
    property: 'Skyline Residency',
    lead: 'Ankit Joshi',
    stage: 'Proposal Sent',
    value: 5000000,
    commission: 150000,
    closingDate: '2026-05-15',
    probability: 75,
    owner: 'Rahul Sharma',
    created: '2026-03-20',
  },
  {
    id: 2,
    name: 'Green Valley Villa - Premium 3BHK',
    property: 'Green Valley Villa',
    lead: 'Seema Patel',
    stage: 'Negotiation',
    value: 8500000,
    commission: 255000,
    closingDate: '2026-04-30',
    probability: 60,
    owner: 'Priya Mehta',
    created: '2026-03-18',
  },
  {
    id: 3,
    name: 'Corporate Park - Commercial Space',
    property: 'Corporate Park',
    lead: 'Rohit Das',
    stage: 'Contract Review',
    value: 22000000,
    commission: 550000,
    closingDate: '2026-06-01',
    probability: 85,
    owner: 'Kiran Rao',
    created: '2026-02-28',
  },
  {
    id: 4,
    name: 'Urban Homes - Penthouse 4BHK',
    property: 'Urban Homes',
    lead: 'Neha Reddy',
    stage: 'Won',
    value: 15000000,
    commission: 450000,
    closingDate: '2026-04-08',
    probability: 100,
    owner: 'Deepak Nair',
    created: '2026-01-15',
  },
  {
    id: 5,
    name: 'Metro Heights - Plot Sale',
    property: 'Metro Heights',
    lead: 'Vikram Kapoor',
    stage: 'Lead Qualification',
    value: 3800000,
    commission: 76000,
    closingDate: '2026-07-15',
    probability: 30,
    owner: 'Anita Singh',
    created: '2026-04-05',
  },
]

const STAGES = ['All', 'Lead Qualification', 'Needs Analysis', 'Proposal Sent', 'Negotiation', 'Contract Review', 'Won', 'Lost']

const STAGE_STYLES = {
  'Lead Qualification': 'bg-blue-50 text-blue-700 border-blue-200',
  'Needs Analysis': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Proposal Sent': 'bg-amber-50 text-amber-700 border-amber-200',
  'Negotiation': 'bg-orange-50 text-orange-700 border-orange-200',
  'Contract Review': 'bg-purple-50 text-purple-700 border-purple-200',
  'Won': 'bg-green-50 text-green-700 border-green-200',
  'Lost': 'bg-red-50 text-red-700 border-red-200',
}

export default function AllDealsPage() {
  const [search, setSearch] = useState('')
  const [filterStage, setFilterStage] = useState('All')
  const [filterOwner, setFilterOwner] = useState('All')
  const [view, setView] = useState('table')
  const [sortBy, setSortBy] = useState('closingDate')

  const owners = ['All', ...new Set(MOCK_DEALS.map((d) => d.owner))]

  let filtered = MOCK_DEALS.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.property.toLowerCase().includes(search.toLowerCase()) ||
      d.lead.toLowerCase().includes(search.toLowerCase())
    const matchStage = filterStage === 'All' || d.stage === filterStage
    const matchOwner = filterOwner === 'All' || d.owner === filterOwner
    return matchSearch && matchStage && matchOwner
  })

  if (sortBy === 'value') filtered = filtered.sort((a, b) => b.value - a.value)
  else if (sortBy === 'probability') filtered = filtered.sort((a, b) => b.probability - a.probability)
  else filtered = filtered.sort((a, b) => new Date(a.closingDate) - new Date(b.closingDate))

  const stats = {
    total: MOCK_DEALS.length,
    totalValue: MOCK_DEALS.reduce((a, d) => a + d.value, 0),
    totalCommission: MOCK_DEALS.reduce((a, d) => a + d.commission, 0),
    won: MOCK_DEALS.filter((d) => d.stage === 'Won').length,
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Deals</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage your sales pipeline</p>
        </div>
        <Link
          to="/deals/add"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Deal
        </Link>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total Deals',
            value: stats.total,
            color: 'bg-gray-50 border-gray-200 text-gray-700',
            dot: 'bg-gray-400',
          },
          {
            label: 'Total Value',
            value: `INR ${(stats.totalValue / 10000000).toFixed(1)} Cr`,
            color: 'bg-green-50 border-green-200 text-green-700',
            dot: 'bg-green-500',
          },
          {
            label: 'Commission',
            value: `INR ${(stats.totalCommission / 100000).toFixed(1)} L`,
            color: 'bg-blue-50 border-blue-200 text-blue-700',
            dot: 'bg-blue-500',
          },
          {
            label: 'Won',
            value: stats.won,
            color: 'bg-primary-50 border-primary-200 text-primary-700',
            dot: 'bg-primary-500',
          },
        ].map(({ label, value, color, dot }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${color}`}>
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
            <div>
              <p className="text-xs font-medium opacity-70">{label}</p>
              <p className="text-2xl font-bold leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {STAGES.map((s) => <option key={s}>{s === 'All' ? 'All Stages' : s}</option>)}
        </select>

        <select
          value={filterOwner}
          onChange={(e) => setFilterOwner(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {owners.map((o) => <option key={o}>{o === 'All' ? 'All Owners' : o}</option>)}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="closingDate">Sort by Closing Date</option>
          <option value="value">Sort by Value</option>
          <option value="probability">Sort by Probability</option>
        </select>

        <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setView('table')}
            className={`px-3 py-2.5 transition ${view === 'table' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setView('pipeline')}
            className={`px-3 py-2.5 transition ${view === 'pipeline' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 4H5a2 2 0 00-2 2v14a2 2 0 002 2h4m0-21v21m0-21h4a2 2 0 012 2v14a2 2 0 01-2 2h-4m0-21v21m0-21h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4">{filtered.length} deal{filtered.length === 1 ? '' : 's'} found</p>

      {/* Table view */}
      {view === 'table' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-400 text-sm">No deals match your filters</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-5 py-3">Deal Name</th>
                    <th className="px-5 py-3">Stage</th>
                    <th className="px-5 py-3">Value</th>
                    <th className="px-5 py-3">Commission</th>
                    <th className="px-5 py-3">Win %</th>
                    <th className="px-5 py-3">Closing Date</th>
                    <th className="px-5 py-3">Owner</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{d.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{d.lead}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-medium border ${STAGE_STYLES[d.stage] || 'bg-gray-50'}`}
                        >
                          {d.stage}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900">INR {(d.value / 1000000).toFixed(1)} Cr</td>
                      <td className="px-5 py-4 text-gray-600">INR {(d.commission / 100000).toFixed(1)} L</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary-600 rounded-full"
                              style={{ width: `${d.probability}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gray-700 w-8">{d.probability}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs">{d.closingDate}</td>
                      <td className="px-5 py-4 text-gray-600 text-xs font-medium">{d.owner}</td>
                      <td className="px-5 py-4">
                        <Link to={`/deals/${d.id}`} className="text-primary-600 hover:text-primary-800 text-xs font-medium">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pipeline view */}
      {view === 'pipeline' && (
        <Link to="/deals/pipeline" className="block bg-blue-50 border border-blue-200 rounded-xl p-6 text-center">
          <p className="text-blue-700 text-sm font-medium">
            Switch to Pipeline View →
          </p>
        </Link>
      )}
    </div>
  )
}
