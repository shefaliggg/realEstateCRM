import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

const MOCK_PROPERTIES = {
  1: {
    id: 1,
    title: 'Skyline Residency - 3BHK',
    type: 'Building',
    status: 'Available',
    price: 8500000,
    pricePerSqft: 5862,
    area: 1450,
    bedrooms: 3,
    bathrooms: 2,
    floor: '12th',
    city: 'Mumbai',
    locality: 'Andheri West',
    state: 'Maharashtra',
    pincode: '400053',
    project: 'Skyline Heights',
    description:
      'A premium 3BHK building in Andheri West with modern interiors, modular kitchen, and large balconies.',
    highlights: ['Metro connectivity nearby', 'City view', 'Italian marble flooring'],
    amenities: ['Swimming Pool', 'Gymnasium', 'Clubhouse', 'Lift', 'Power Backup'],
    assignedPartner: {
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul@example.com',
    },
    leads: 8,
    visits: 3,
    createdAt: '2025-11-15',
  },
  2: {
    id: 2,
    title: 'Green Valley Villa',
    type: 'Villa',
    status: 'Booked',
    price: 22000000,
    pricePerSqft: 6875,
    area: 3200,
    bedrooms: 4,
    bathrooms: 4,
    floor: 'G+2',
    city: 'Pune',
    locality: 'Baner',
    state: 'Maharashtra',
    pincode: '411045',
    project: 'Green Valley Township',
    description: 'A luxury villa with private garden and rooftop terrace in Baner.',
    highlights: ['Private garden', 'Rooftop terrace', 'Smart home automation'],
    amenities: ['Swimming Pool', 'Gymnasium', 'Garden / Landscape', 'Security / CCTV'],
    assignedPartner: {
      name: 'Priya Mehta',
      phone: '+91 91234 56789',
      email: 'priya@example.com',
    },
    leads: 5,
    visits: 7,
    createdAt: '2025-10-08',
  },
  3: {
    id: 3,
    title: 'Commercial Space - IT Park',
    type: 'Commercial',
    status: 'Available',
    price: 15000000,
    pricePerSqft: 7142,
    area: 2100,
    bedrooms: null,
    bathrooms: 2,
    floor: '5th',
    city: 'Hyderabad',
    locality: 'HITEC City',
    state: 'Telangana',
    pincode: '500081',
    project: 'Tech Square',
    description: 'Prime commercial floor plate in HITEC City with excellent connectivity.',
    highlights: ['Tech corridor location', 'Metro nearby', 'Fiber internet ready'],
    amenities: ['Lift', 'Power Backup', 'Security / CCTV', 'Visitor Parking'],
    assignedPartner: {
      name: 'Kiran Rao',
      phone: '+91 90000 12345',
      email: 'kiran@example.com',
    },
    leads: 12,
    visits: 5,
    createdAt: '2025-09-20',
  },
}

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

const TABS = ['Overview', 'Leads & Visits', 'Documents', 'Activity']

function formatPrice(v) {
  if (v >= 10000000) return `INR ${(v / 10000000).toFixed(2)} Cr`
  if (v >= 100000) return `INR ${(v / 100000).toFixed(1)} L`
  return `INR ${v.toLocaleString('en-IN')}`
}

function amenityIcon(name) {
  const n = name.toLowerCase()
  if (n.includes('pool')) return '🏊'
  if (n.includes('gym')) return '🏋️'
  if (n.includes('club')) return '🏛️'
  if (n.includes('indoor game')) return '🎮'
  if (n.includes('outdoor sport')) return '🏸'
  if (n.includes('jogging') || n.includes('track')) return '🏃'
  if (n.includes('play')) return '🧒'
  if (n.includes('multipurpose') || n.includes('hall')) return '🏢'
  if (n.includes('power backup')) return '🔋'
  if (n.includes('lift')) return '🛗'
  if (n.includes('cctv') || n.includes('security')) return '🛡️'
  if (n.includes('parking')) return '🅿️'
  if (n.includes('ev charg')) return '🔌'
  if (n.includes('garden') || n.includes('landscape')) return '🌳'
  if (n.includes('temple')) return '🛕'
  if (n.includes('market')) return '🛒'
  if (n.includes('pharmacy')) return '💊'
  if (n.includes('basketball')) return '🏀'
  if (n.includes('tennis')) return '🎾'
  if (n.includes('yoga')) return '🧘'
  return '✨'
}

function Icon({ d, cls = 'w-4 h-4' }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
    </svg>
  )
}

function StatCard({ label, value, sub, iconPath }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600">
        <Icon d={iconPath} />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold text-gray-900 leading-tight">{value}</p>
        <p className="text-[10px] text-gray-500">{sub}</p>
      </div>
    </div>
  )
}

function Spec({ label, value }) {
  if (!value && value !== 0) return null
  return (
    <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-800 mt-1">{value}</p>
    </div>
  )
}

export default function PropertyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [tab, setTab] = useState('Overview')
  const p = MOCK_PROPERTIES[Number(id)]

  if (!p) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-400 text-sm mb-4">Property not found.</p>
        <Link to="/properties" className="text-primary-600 text-sm font-medium hover:underline">
          Back to Properties
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition shrink-0"
          >
            <Icon d="M15 19l-7-7 7-7" cls="w-5 h-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap mb-1">
              <nav className="text-xs text-gray-400 flex items-center gap-1.5 whitespace-nowrap">
                <Link to="/properties" className="hover:text-primary-600">Properties</Link>
                <span>/</span>
                <span className="text-gray-700 truncate">{p.title}</span>
              </nav>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_STYLES[p.status]}`}>
                {p.status}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${TYPE_STYLES[p.type] ?? 'bg-gray-100 text-gray-600'}`}>
                {p.type}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {p.locality}, {p.city}, {p.state} - {p.pincode}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition">
            <Icon d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            Edit
          </button>
          <button className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition">
            <Icon d="M12 4v16m8-8H4" />
            Add Lead
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Listing Price"
          value={formatPrice(p.price)}
          sub="Current listing"
          iconPath="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
        <StatCard
          label="Price / sq ft"
          value={`INR ${p.pricePerSqft?.toLocaleString('en-IN')}`}
          sub={`${p.area.toLocaleString()} sq ft total`}
          iconPath="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
        />
        <StatCard
          label="Leads"
          value={p.leads}
          sub="Enquiries"
          iconPath="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <StatCard
          label="Site Visits"
          value={p.visits}
          sub="Scheduled"
          iconPath="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </div>

      <div className="flex gap-1 mb-5 bg-white border border-gray-100 rounded-xl p-1 w-fit shadow-sm">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
              tab === t ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && <OverviewTab p={p} />}
      {tab === 'Leads & Visits' && <LeadsTab />}
      {tab === 'Documents' && <DocumentsTab />}
      {tab === 'Activity' && <ActivityTab p={p} />}
    </div>
  )
}

function OverviewTab({ p }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        {/* Photo Gallery */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-4 grid-rows-2 h-64 gap-1 p-1">
            <div className="col-span-2 row-span-2 bg-gradient-to-br from-primary-100 to-primary-50 rounded-lg flex items-center justify-center relative group cursor-pointer">
              <Icon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" cls="w-12 h-12 text-primary-300" />
              <span className="absolute bottom-2 left-2 text-xs font-semibold text-white bg-black/40 px-2 py-1 rounded-md group-hover:bg-black/60 transition">Main Photo</span>
            </div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:shadow-md transition group">
                <Icon d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" cls="w-6 h-6 text-gray-200 group-hover:text-gray-300" />
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-50 flex gap-2">
            <button className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-medium hover:text-primary-800 transition">
              <Icon d="M12 4v16m8-8H4" cls="w-3 h-3" />
              Upload Photos
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Property Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Spec label="Area" value={`${p.area.toLocaleString()} sq ft`} />
            <Spec label="Bedrooms" value={p.bedrooms} />
            <Spec label="Bathrooms" value={p.bathrooms} />
            <Spec label="Floor" value={p.floor} />
            <Spec label="Project" value={p.project} />
            <Spec label="Type" value={p.type} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Description</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{p.description}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Highlights</h3>
          <ul className="space-y-2">
            {p.highlights.map((h) => (
              <li key={h} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                {h}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Assigned Channel Partner</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-sm">
              {p.assignedPartner.name
                .split(' ')
                .map((w) => w[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{p.assignedPartner.name}</p>
              <p className="text-xs text-gray-500">Channel Partner</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">{p.assignedPartner.phone}</p>
          <p className="text-sm text-gray-600">{p.assignedPartner.email}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {p.amenities.map((a) => (
              <span key={a} className="text-xs px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full border border-primary-100 font-medium">
                {amenityIcon(a)} {a}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function LeadsTab() {
  const mockLeads = [
    {
      id: 1,
      name: 'Ankit Joshi',
      phone: '+91 98765 11111',
      source: 'Website',
      stage: 'Contacted',
      date: '2026-04-10',
    },
    {
      id: 2,
      name: 'Seema Patel',
      phone: '+91 91234 22222',
      source: 'Referral',
      stage: 'Site Visit Scheduled',
      date: '2026-04-08',
    },
    {
      id: 3,
      name: 'Rohit Das',
      phone: '+91 87654 33333',
      source: '99acres',
      stage: 'Negotiation',
      date: '2026-04-05',
    },
  ]

  const stageStyles = {
    'New': 'bg-blue-50 text-blue-700',
    'Contacted': 'bg-amber-50 text-amber-700',
    'Site Visit Scheduled': 'bg-purple-50 text-purple-700',
    'Negotiation': 'bg-orange-50 text-orange-700',
    'Closed Won': 'bg-green-50 text-green-700',
    'Closed Lost': 'bg-red-50 text-red-600',
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{mockLeads.length} leads interested in this property</p>
        <button className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
          <Icon d="M12 4v16m8-8H4" cls="w-3.5 h-3.5" />
          Add Lead
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-left text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3">Lead</th>
                <th className="px-5 py-3">Source</th>
                <th className="px-5 py-3">Stage</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mockLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition">
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900">{lead.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{lead.phone}</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{lead.source}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${stageStyles[lead.stage] ?? 'bg-gray-100 text-gray-600'}`}>
                      {lead.stage}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {new Date(lead.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-5 py-4">
                    <button className="text-primary-600 hover:text-primary-800 text-xs font-medium">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function DocumentsTab() {
  const documents = [
    { name: 'Title Deed', status: 'Downloaded', date: 'Jan 15, 2026', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Floor Plan', status: 'Downloaded', date: 'Jan 15, 2026', icon: 'M4 5a2 2 0 012-2h6a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5z' },
    { name: 'Encumbrance Certificate', status: 'Pending', date: null, icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'RERA Certificate', status: 'Downloaded', date: 'Feb 02, 2026', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'NOC from Society', status: 'Downloaded', date: 'Jan 20, 2026', icon: 'M5 13l4 4L19 7' },
    { name: 'Property Brochure', status: 'Pending', date: null, icon: 'M12 6.253v13m0-13C6.5 6.253 2 10.998 2 12s4.5 5.747 10 5.747m0-13c5.5 0 10 4.748 10 5.747m0 0v13m0-13C21.5 6.253 17 10.998 17 12' },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-gray-800">Property Documents</h3>
          <button className="inline-flex items-center gap-1.5 text-xs text-primary-600 border border-primary-200 hover:bg-primary-50 rounded-lg px-3 py-1.5 font-medium transition">
            <Icon d="M12 4v16m8-8H4" cls="w-3.5 h-3.5" />
            Upload
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <div key={doc.name} className="flex items-center gap-3 p-4 rounded-lg border border-gray-100 hover:shadow-md hover:border-primary-100 transition">
              <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                <Icon d={doc.icon} cls="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-800 truncate">{doc.name}</p>
                {doc.date
                  ? <p className="text-[10px] text-gray-400 mt-0.5">{doc.date}</p>
                  : <p className="text-[10px] text-amber-500 mt-0.5 font-medium">Pending upload</p>
                }
              </div>
              {doc.status === 'Downloaded'
                ? <button className="text-[10px] text-primary-600 font-medium shrink-0 hover:text-primary-800 transition">Download</button>
                : <button className="text-[10px] text-primary-600 font-medium shrink-0 hover:text-primary-800 transition">Upload</button>
              }
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ActivityTab({ p }) {
  const events = [
    {
      icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-2.34A6 6 0 0012 3.07M3 17.9v3.93c0 .712.505 1.346 1.195 1.486L12 22.54l7.805-1.161A1.5 1.5 0 0021 21.83v-3.93',
      text: 'Property uploaded to system',
      time: new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }),
      color: 'bg-primary-100 text-primary-700',
    },
    {
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      text: `Assigned to ${p.assignedPartner.name}`,
      time: new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long' }),
      color: 'bg-blue-100 text-blue-700',
    },
    {
      icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
      text: 'Lead inquiry received for viewing',
      time: '10 Apr 2026',
      color: 'bg-amber-100 text-amber-700',
    },
    {
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      text: 'Site visit scheduled',
      time: '08 Apr 2026',
      color: 'bg-purple-100 text-purple-700',
    },
    {
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      text: 'Negotiation in progress',
      time: '05 Apr 2026',
      color: 'bg-orange-100 text-orange-700',
    },
  ]

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 max-w-2xl">
      <h3 className="text-sm font-bold text-gray-800 mb-5">Activity Timeline</h3>
      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gray-100" />
        <div className="space-y-6">
          {events.map((ev, i) => (
            <div key={i} className="flex items-start gap-4 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm shrink-0 z-10 ${ev.color}`}>
                <Icon d={ev.icon} cls="w-5 h-5" />
              </div>
              <div className="pt-1">
                <p className="text-sm text-gray-800 font-medium">{ev.text}</p>
                <p className="text-xs text-gray-400 mt-1">{ev.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
