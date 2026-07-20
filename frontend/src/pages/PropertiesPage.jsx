import { useState } from 'react'
import { Link } from 'react-router-dom'

const MOCK_PROPERTIES = [
  {
    id: 1, title: 'Skyline Residency – 3BHK', type: 'Building', status: 'Available',
    price: 8500000, area: 1450, beds: 3, baths: 2,
    city: 'Mumbai', locality: 'Andheri West', floor: '12th Floor',
    project: 'Skyline Heights',
  },
  {
    id: 2, title: 'Green Valley Villa', type: 'Villa', status: 'Booked',
    price: 22000000, area: 3200, beds: 4, baths: 4,
    city: 'Pune', locality: 'Baner', floor: 'G+2',
    project: 'Green Valley Township',
  },
  {
    id: 3, title: 'Commercial Space – IT Park', type: 'Commercial', status: 'Available',
    price: 15000000, area: 2100, beds: null, baths: 2,
    city: 'Hyderabad', locality: 'HITEC City', floor: '5th Floor',
    project: 'Tech Square',
  },
  {
    id: 4, title: 'Sunrise Buildings – 2BHK', type: 'Building', status: 'Sold',
    price: 5200000, area: 980, beds: 2, baths: 2,
    city: 'Bangalore', locality: 'Whitefield', floor: '4th Floor',
    project: 'Sunrise Residencia',
  },
  {
    id: 5, title: 'Corner Plot – Residential', type: 'Plot', status: 'Available',
    price: 3800000, area: 1200, beds: null, baths: null,
    city: 'Jaipur', locality: 'Jagatpura', floor: 'Ground',
    project: null,
  },
  {
    id: 6, title: 'Luxury Penthouse – 4BHK', type: 'Building', status: 'Under Construction',
    price: 32000000, area: 4200, beds: 4, baths: 5,
    city: 'Mumbai', locality: 'Worli', floor: '32nd Floor',
    project: 'The Crown Tower',
  },
]

const STATUS_STYLES = {
  Available: 'bg-green-50 text-green-700 border border-green-200',
  Booked: 'bg-amber-50 text-amber-700 border border-amber-200',
  Sold: 'bg-red-50 text-red-600 border border-red-200',
  'Under Construction': 'bg-blue-50 text-blue-700 border border-blue-200',
}

const TYPE_STYLES = {
  Building: 'bg-primary-50 text-primary-700',
  Villa: 'bg-purple-50 text-purple-700',
  Commercial: 'bg-cyan-50 text-cyan-700',
  Plot: 'bg-lime-50 text-lime-700',
}

const TYPES = ['All', 'Building', 'Villa', 'Commercial', 'Plot']
const STATUSES = ['All', 'Available', 'Booked', 'Sold', 'Under Construction']

function formatPrice(p) {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`
  return `₹${p.toLocaleString('en-IN')}`
}

export default function PropertiesPage() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [view, setView] = useState('grid') // 'grid' | 'table'

  const filtered = MOCK_PROPERTIES.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase()) ||
      p.locality.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'All' || p.type === filterType
    const matchStatus = filterStatus === 'All' || p.status === filterStatus
    return matchSearch && matchType && matchStatus
  })

  const counts = {
    total: MOCK_PROPERTIES.length,
    available: MOCK_PROPERTIES.filter((p) => p.status === 'Available').length,
    booked: MOCK_PROPERTIES.filter((p) => p.status === 'Booked').length,
    sold: MOCK_PROPERTIES.filter((p) => p.status === 'Sold').length,
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Properties</h2>
        </div>
        <Link
          to="/properties/add"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Property
        </Link>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: counts.total, color: 'bg-gray-50 border-gray-200 text-gray-700', dot: 'bg-gray-400' },
          { label: 'Available', value: counts.available, color: 'bg-green-50 border-green-200 text-green-700', dot: 'bg-green-500' },
          { label: 'Booked', value: counts.booked, color: 'bg-amber-50 border-amber-200 text-amber-700', dot: 'bg-amber-500' },
          { label: 'Sold', value: counts.sold, color: 'bg-red-50 border-red-200 text-red-600', dot: 'bg-red-500' },
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
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, city or locality…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Type filter */}
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {TYPES.map((t) => <option key={t}>{t === 'All' ? 'All Types' : t}</option>)}
        </select>

        {/* Status filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {STATUSES.map((s) => <option key={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
        </select>

        {/* View toggle */}
        <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setView('grid')}
            className={`px-3 py-2.5 transition ${view === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setView('table')}
            className={`px-3 py-2.5 transition ${view === 'table' ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400 mb-4">{filtered.length} propert{filtered.length === 1 ? 'y' : 'ies'} found</p>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.length === 0 ? (
            <div className="col-span-3 py-20 text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-sm">No properties match your filters</p>
            </div>
          ) : (
            filtered.map((p) => <PropertyCard key={p.id} p={p} />)
          )}
        </div>
      )}

      {/* Table view */}
      {view === 'table' && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-20 text-center text-gray-400 text-sm">No properties match your filters</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-5 py-3">Property</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Size</th>
                    <th className="px-5 py-3">Price</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 leading-tight">{p.title}</p>
                        {p.project && <p className="text-xs text-gray-400 mt-0.5">{p.project}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_STYLES[p.type] ?? 'bg-gray-100 text-gray-600'}`}>
                          {p.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-600">{p.locality}, {p.city}</td>
                      <td className="px-5 py-4 text-gray-600">{p.area.toLocaleString()} sq ft</td>
                      <td className="px-5 py-4 font-semibold text-gray-900">{formatPrice(p.price)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[p.status]}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link to={`/properties/${p.id}`} className="text-primary-600 hover:text-primary-800 text-xs font-medium">View</Link>
                          <span className="text-gray-300">|</span>
                          <Link to={`/properties/${p.id}/edit`} className="text-gray-500 hover:text-gray-800 text-xs font-medium">Edit</Link>
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
    </div>
  )
}

function PropertyCard({ p }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition group">
      {/* Image placeholder */}
      <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 relative flex items-center justify-center">
        <svg className="w-14 h-14 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        {/* Status badge top-right */}
        <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLES[p.status]}`}>
          {p.status}
        </span>
        {/* Type badge top-left */}
        <span className={`absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-medium ${TYPE_STYLES[p.type] ?? 'bg-gray-100 text-gray-600'}`}>
          {p.type}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">{p.title}</h3>
        {p.project && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{p.project}</p>}

        <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {p.locality}, {p.city} · {p.floor}
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            {p.area.toLocaleString()} sq ft
          </span>
          {p.beds !== null && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              {p.beds} Bed
            </span>
          )}
          {p.baths !== null && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              {p.baths} Bath
            </span>
          )}
        </div>

        {/* Price + actions */}
        <div className="flex items-center justify-between mt-4">
          <p className="text-base font-bold text-primary-600">{formatPrice(p.price)}</p>
          <div className="flex items-center gap-2">
            <Link
              to={`/properties/${p.id}`}
              className="text-xs px-3 py-1.5 border border-primary-200 text-primary-700 rounded-lg hover:bg-primary-50 transition font-medium"
            >
              View
            </Link>
            <Link
              to={`/properties/${p.id}/edit`}
              className="text-xs px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Edit
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
