import { useState } from 'react'
import { Link } from 'react-router-dom'

const MOCK_MY_LEADS = [
  {
    id: 1,
    name: 'Ankit Joshi',
    phone: '+91 98765 11111',
    email: 'ankit.joshi@email.com',
    source: 'Website',
    stage: 'Contacted',
    budget: 5000000,
    lastContact: '2026-04-10',
    daysActive: 5,
    priority: 'High',
  },
  {
    id: 4,
    name: 'Neha Reddy',
    phone: '+91 90876 54321',
    email: 'neha.reddy@email.com',
    source: 'Google Ads',
    stage: 'Hot Lead',
    budget: 15000000,
    lastContact: '2026-04-12',
    daysActive: 2,
    priority: 'Critical',
  },
  {
    id: 3,
    name: 'Rohit Das',
    phone: '+91 87654 33333',
    email: 'rohit.das@email.com',
    source: '99acres',
    stage: 'Negotiation',
    budget: 22000000,
    lastContact: '2026-04-05',
    daysActive: 7,
    priority: 'High',
  },
]

const priorityColors = {
  'Critical': 'bg-red-50 text-red-700 border-red-200',
  'High': 'bg-orange-50 text-orange-700 border-orange-200',
  'Medium': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Low': 'bg-green-50 text-green-700 border-green-200',
}

const stageStyles = {
  'New': 'bg-blue-50 text-blue-700 border-blue-200',
  'Contacted': 'bg-amber-50 text-amber-700 border-amber-200',
  'Site Visit Scheduled': 'bg-purple-50 text-purple-700 border-purple-200',
  'Negotiation': 'bg-orange-50 text-orange-700 border-orange-200',
  'Hot Lead': 'bg-red-50 text-red-700 border-red-200',
}

export default function MyLeadsPage() {
  const [search, setSearch] = useState('')

  const filtered = MOCK_MY_LEADS.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.phone.includes(search) ||
    l.email.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    myLeads: MOCK_MY_LEADS.length,
    hotLeads: MOCK_MY_LEADS.filter((l) => l.stage === 'Hot Lead').length,
    negotiating: MOCK_MY_LEADS.filter((l) => l.stage === 'Negotiation').length,
    thisWeek: MOCK_MY_LEADS.filter((l) => l.daysActive <= 7).length,
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Leads</h2>
        </div>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'My Leads', value: stats.myLeads, color: 'bg-gray-50 border-gray-200 text-gray-700', dot: 'bg-gray-400' },
          { label: 'Hot Leads', value: stats.hotLeads, color: 'bg-red-50 border-red-200 text-red-700', dot: 'bg-red-500' },
          { label: 'Negotiating', value: stats.negotiating, color: 'bg-orange-50 border-orange-200 text-orange-700', dot: 'bg-orange-500' },
          { label: 'This Week', value: stats.thisWeek, color: 'bg-blue-50 border-blue-200 text-blue-700', dot: 'bg-blue-500' },
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

      {/* Search */}
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4">{filtered.length} lead{filtered.length === 1 ? '' : 's'}</p>

      {/* Kanban-style cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-sm">No leads match your search</p>
          </div>
        ) : (
          filtered.map((l) => (
            <Link
              key={l.id}
              to={`/leads/${l.id}`}
              className="block bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-primary-200 transition group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-2">
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600">{l.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${stageStyles[l.stage]}`}>
                      {l.stage}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {l.phone}
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {l.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Budget</p>
                    <p className="text-sm font-bold text-gray-900">INR {(l.budget / 1000000).toFixed(1)} Cr</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold border ${priorityColors[l.priority]}`}>
                      {l.priority}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span>{l.source}</span>
                <span>Last contact: {l.lastContact}</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
