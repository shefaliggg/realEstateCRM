import { useState } from 'react'
import { Link } from 'react-router-dom'

const MOCK_MY_DEALS = [
  {
    id: 1,
    name: 'Skyline Residency - 2BHK Building',
    lead: 'Ankit Joshi',
    stage: 'Proposal Sent',
    value: 5000000,
    commission: 150000,
    closingDate: '2026-05-15',
    probability: 75,
    daysRemaining: 33,
    priority: 'High',
  },
  {
    id: 3,
    name: 'Corporate Park - Commercial Space',
    lead: 'Rohit Das',
    stage: 'Contract Review',
    value: 22000000,
    commission: 550000,
    closingDate: '2026-06-01',
    probability: 85,
    daysRemaining: 50,
    priority: 'Critical',
  },
]

const priorityColors = {
  'Critical': 'bg-red-50 text-red-700 border-red-200',
  'High': 'bg-orange-50 text-orange-700 border-orange-200',
  'Medium': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Low': 'bg-green-50 text-green-700 border-green-200',
}

const stageStyles = {
  'Proposal Sent': 'bg-amber-50 text-amber-700',
  'Negotiation': 'bg-orange-50 text-orange-700',
  'Contract Review': 'bg-purple-50 text-purple-700',
}

export default function MyDealsPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_MY_DEALS.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.lead.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    myDeals: MOCK_MY_DEALS.length,
    totalValue: MOCK_MY_DEALS.reduce((a, d) => a + d.value, 0),
    totalCommission: MOCK_MY_DEALS.reduce((a, d) => a + d.commission, 0),
    avgProbability: Math.round(MOCK_MY_DEALS.reduce((a, d) => a + d.probability, 0) / MOCK_MY_DEALS.length),
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Deals</h2>
        </div>
        <Link
          to="/deals"
          className="text-sm font-medium text-primary-600 hover:text-primary-800 flex items-center gap-1"
        >
          View All
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'My Deals', value: stats.myDeals, color: 'bg-gray-50 border-gray-200 text-gray-700', dot: 'bg-gray-400' },
          { label: 'Total Value', value: `INR ${(stats.totalValue / 10000000).toFixed(1)} Cr`, color: 'bg-green-50 border-green-200 text-green-700', dot: 'bg-green-500' },
          { label: 'Commission', value: `INR ${(stats.totalCommission / 100000).toFixed(1)} L`, color: 'bg-blue-50 border-blue-200 text-blue-700', dot: 'bg-blue-500' },
          { label: 'Avg Win %', value: `${stats.avgProbability}%`, color: 'bg-primary-50 border-primary-200 text-primary-700', dot: 'bg-primary-500' },
        ].map(({ label, value, color, dot }) => (
          <div key={label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${color}`}>
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dot}`} />
            <div>
              <p className="text-xs font-medium opacity-70">{label}</p>
              <p className="text-lg font-bold leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deals…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4">{filtered.length} deal{filtered.length === 1 ? '' : 's'}</p>

      {/* Deal cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No deals match your search</p>
          </div>
        ) : (
          filtered.map((d) => (
            <Link
              key={d.id}
              to={`/deals/${d.id}`}
              className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-primary-200 transition group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 leading-tight">{d.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${stageStyles[d.stage]}`}>
                      {d.stage}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${priorityColors[d.priority]}`}>
                      {d.priority}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Lead: {d.lead}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase">Deal Value</p>
                    <p className="text-sm font-bold text-gray-900">INR {(d.value / 1000000).toFixed(1)} Cr</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase">Win %</p>
                    <p className="text-sm font-bold text-primary-600">{d.probability}%</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Commission: INR {(d.commission / 100000).toFixed(2)} L</span>
                  <span>Closing: {d.closingDate}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${d.daysRemaining <= 7 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {d.daysRemaining} days left
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
