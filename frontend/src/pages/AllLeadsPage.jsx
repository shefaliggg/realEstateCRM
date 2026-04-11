import { useState } from 'react'
import { Link } from 'react-router-dom'

const MOCK_LEADS = [
  {
    id: 1,
    name: 'Ankit Joshi',
    phone: '+91 98765 11111',
    email: 'ankit.joshi@email.com',
    source: 'Website',
    stage: 'Contacted',
    budget: 5000000,
    requirements: '2BHK, South Mumbai, Ready to move',
    interestedProperties: 2,
    lastContact: '2026-04-10',
    assignedTo: 'Rahul Sharma',
    rating: 4,
  },
  {
    id: 2,
    name: 'Seema Patel',
    phone: '+91 91234 22222',
    email: 'seema.p@email.com',
    source: 'Referral',
    stage: 'Site Visit Scheduled',
    budget: 8500000,
    requirements: '3BHK Villa, Pune',
    interestedProperties: 1,
    lastContact: '2026-04-08',
    assignedTo: 'Priya Mehta',
    rating: 5,
  },
  {
    id: 3,
    name: 'Rohit Das',
    phone: '+91 87654 33333',
    email: 'rohit.das@email.com',
    source: '99acres',
    stage: 'Negotiation',
    budget: 22000000,
    requirements: '4BHK Penthouse, Mumbai',
    interestedProperties: 3,
    lastContact: '2026-04-05',
    assignedTo: 'Kiran Rao',
    rating: 3,
  },
  {
    id: 4,
    name: 'Neha Reddy',
    phone: '+91 90876 54321',
    email: 'neha.reddy@email.com',
    source: 'Google Ads',
    stage: 'Hot Lead',
    budget: 15000000,
    requirements: 'Commercial space, IT Park',
    interestedProperties: 4,
    lastContact: '2026-04-12',
    assignedTo: 'Deepak Nair',
    rating: 5,
  },
  {
    id: 5,
    name: 'Vikram Kapoor',
    phone: '+91 85432 10987',
    email: 'vikram.k@email.com',
    source: 'Facebook',
    stage: 'Follow-up Needed',
    budget: 3800000,
    requirements: 'Plot, Jaipur',
    interestedProperties: 1,
    lastContact: '2026-03-28',
    assignedTo: 'Anita Singh',
    rating: 2,
  },
]

const SOURCES = ['All', 'Website', 'Referral', '99acres', 'Google Ads', 'Facebook', 'Direct Call']
const STAGES = ['All', 'New', 'Contacted', 'Site Visit Scheduled', 'Negotiation', 'Hot Lead', 'Follow-up Needed', 'Closed Won', 'Closed Lost']
const RATINGS = ['All', '5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star']

const STAGE_STYLES = {
  'New': 'bg-blue-50 text-blue-700 border-blue-200',
  'Contacted': 'bg-amber-50 text-amber-700 border-amber-200',
  'Site Visit Scheduled': 'bg-purple-50 text-purple-700 border-purple-200',
  'Negotiation': 'bg-orange-50 text-orange-700 border-orange-200',
  'Hot Lead': 'bg-red-50 text-red-700 border-red-200',
  'Follow-up Needed': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Closed Won': 'bg-green-50 text-green-700 border-green-200',
  'Closed Lost': 'bg-red-50 text-red-600 border-red-200',
}

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

export default function AllLeadsPage() {
  const [search, setSearch] = useState('')
  const [filterSource, setFilterSource] = useState('All')
  const [filterStage, setFilterStage] = useState('All')
  const [filterRating, setFilterRating] = useState('All')
  const [view, setView] = useState('table')

  const filtered = MOCK_LEADS.filter((l) => {
    const matchSearch =
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.email.toLowerCase().includes(search.toLowerCase())
    const matchSource = filterSource === 'All' || l.source === filterSource
    const matchStage = filterStage === 'All' || l.stage === filterStage
    const matchRating = filterRating === 'All' || (filterRating === '5 Stars' ? l.rating === 5 : filterRating === '4 Stars' ? l.rating === 4 : filterRating === '3 Stars' ? l.rating === 3 : filterRating === '2 Stars' ? l.rating === 2 : l.rating === 1)
    return matchSearch && matchSource && matchStage && matchRating
  })

  const stageCounts = {
    total: MOCK_LEADS.length,
    hot: MOCK_LEADS.filter((l) => l.stage === 'Hot Lead').length,
    negotiation: MOCK_LEADS.filter((l) => l.stage === 'Negotiation').length,
    followUp: MOCK_LEADS.filter((l) => l.stage === 'Follow-up Needed').length,
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">All Leads</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage all leads and their pipeline</p>
        </div>
        <Link
          to="/leads/add"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Lead
        </Link>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Leads', value: stageCounts.total, color: 'bg-gray-50 border-gray-200 text-gray-700', dot: 'bg-gray-400' },
          { label: 'Hot Leads', value: stageCounts.hot, color: 'bg-red-50 border-red-200 text-red-700', dot: 'bg-red-500' },
          { label: 'Negotiating', value: stageCounts.negotiation, color: 'bg-orange-50 border-orange-200 text-orange-700', dot: 'bg-orange-500' },
          { label: 'Follow-up', value: stageCounts.followUp, color: 'bg-yellow-50 border-yellow-200 text-yellow-700', dot: 'bg-yellow-500' },
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
            placeholder="Search by name, phone, or email…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <select
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {SOURCES.map((s) => <option key={s}>{s === 'All' ? 'All Sources' : s}</option>)}
        </select>

        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {STAGES.map((s) => <option key={s}>{s === 'All' ? 'All Stages' : s}</option>)}
        </select>

        <select
          value={filterRating}
          onChange={(e) => setFilterRating(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {RATINGS.map((r) => <option key={r}>{r}</option>)}
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
            onClick={() => setView('grid')}
            className={`px-3 py-2.5 transition ${view === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4">{filtered.length} lead{filtered.length === 1 ? '' : 's'} found</p>

      {/* Table view */}
      {view === 'table' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-400 text-sm">No leads match your filters</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-5 py-3">Lead</th>
                    <th className="px-5 py-3">Source</th>
                    <th className="px-5 py-3">Stage</th>
                    <th className="px-5 py-3">Budget</th>
                    <th className="px-5 py-3">Rating</th>
                    <th className="px-5 py-3">Assigned To</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900">{l.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{l.phone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{l.source}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${STAGE_STYLES[l.stage] || 'bg-gray-50 text-gray-600'}`}>
                          {l.stage}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-gray-900">
                        INR {(l.budget / 1000000).toFixed(1)} Cr
                      </td>
                      <td className="px-5 py-4">
                        <StarRating rating={l.rating} />
                      </td>
                      <td className="px-5 py-4 text-gray-600 text-xs">{l.assignedTo}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link to={`/leads/${l.id}`} className="text-primary-600 hover:text-primary-800 text-xs font-medium">
                            View
                          </Link>
                          <span className="text-gray-300">|</span>
                          <button className="text-gray-500 hover:text-gray-800 text-xs font-medium">Call</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <div className="col-span-3 py-20 text-center text-gray-400 text-sm">
              No leads match your filters
            </div>
          ) : (
            filtered.map((l) => (
              <Link
                key={l.id}
                to={`/leads/${l.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-primary-200 transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{l.name}</h3>
                    <p className="text-xs text-gray-400">{l.phone}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STAGE_STYLES[l.stage] || 'bg-gray-50 text-gray-600'}`}>
                    {l.stage.split(' ')[0]}
                  </span>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Budget</span>
                    <span className="font-semibold text-gray-900">INR {(l.budget / 1000000).toFixed(1)} Cr</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Source</span>
                    <span className="text-gray-700">{l.source}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <StarRating rating={l.rating} />
                  <span className="text-[10px] text-gray-400">{l.interestedProperties} properties</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
