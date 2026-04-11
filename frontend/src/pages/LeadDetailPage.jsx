import { Link, useParams, useNavigate } from 'react-router-dom'

const MOCK_LEADS = {
  1: {
    id: 1,
    name: 'Ankit Joshi',
    phone: '+91 98765 11111',
    email: 'ankit.joshi@email.com',
    source: 'Website',
    stage: 'Contacted',
    budget: 5000000,
    requirements: '2BHK, preferably in South Mumbai with proximity to metro station. Ready to move by June 2026.',
    interestedProperties: [1, 3],
    lastContact: '2026-04-10',
    nextFollowUp: '2026-04-15',
    assignedTo: 'Rahul Sharma',
    rating: 4,
    notes: [
      { date: '2026-04-10', author: 'Rahul Sharma', text: 'Lead showed interest in Skyline Residency. Sent brochure and photos.' },
      { date: '2026-04-08', author: 'Rahul Sharma', text: 'Initial contact via website. Budget confirmed at 50 L.' },
    ],
  },
  2: {
    id: 2,
    name: 'Seema Patel',
    phone: '+91 91234 22222',
    email: 'seema.p@email.com',
    source: 'Referral',
    stage: 'Site Visit Scheduled',
    budget: 8500000,
    requirements: '3BHK Villa in Pune, preferably with private garden and modern amenities.',
    interestedProperties: [2],
    lastContact: '2026-04-08',
    nextFollowUp: '2026-04-13',
    assignedTo: 'Priya Mehta',
    rating: 5,
    notes: [
      { date: '2026-04-08', author: 'Priya Mehta', text: 'Site visit scheduled for Green Valley Villa on April 13, 2pm.' },
      { date: '2026-04-05', author: 'Priya Mehta', text: 'Referred by Ramesh Kumar. Strong interest in villa properties.' },
    ],
  },
}

export default function LeadDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const lead = MOCK_LEADS[Number(id)]

  if (!lead) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-400 text-sm mb-4">Lead not found.</p>
        <Link to="/leads" className="text-primary-600 text-sm font-medium hover:underline">
          Back to Leads
        </Link>
      </div>
    )
  }

  const stageStyles = {
    'New': 'bg-blue-50 text-blue-700',
    'Contacted': 'bg-amber-50 text-amber-700',
    'Site Visit Scheduled': 'bg-purple-50 text-purple-700',
    'Negotiation': 'bg-orange-50 text-orange-700',
    'Hot Lead': 'bg-red-50 text-red-700',
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <nav className="text-xs text-gray-400 mb-1">
              <Link to="/leads" className="hover:text-primary-600">Leads</Link>
              <span className="mx-1">/</span>
              <span className="text-gray-700">{lead.name}</span>
            </nav>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${stageStyles[lead.stage]}`}>
                {lead.stage}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call
          </button>
          <button className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Contact Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phone</span>
                <a href={`tel:${lead.phone}`} className="text-primary-600 font-medium hover:underline">
                  {lead.phone}
                </a>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email</span>
                <a href={`mailto:${lead.email}`} className="text-primary-600 font-medium hover:underline">
                  {lead.email}
                </a>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Requirements</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{lead.requirements}</p>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Notes & Activity</h3>
            <div className="space-y-4">
              {lead.notes.map((note, i) => (
                <div key={i} className="pb-4 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-800">{note.author}</p>
                    <p className="text-xs text-gray-400">{note.date}</p>
                  </div>
                  <p className="text-sm text-gray-600">{note.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Lead Stats */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Lead Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Source</span>
                <span className="font-medium text-gray-900">{lead.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Budget</span>
                <span className="font-medium text-gray-900">INR {(lead.budget / 1000000).toFixed(1)} Cr</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Rating</span>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      className={`w-3.5 h-3.5 ${i <= lead.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Timeline</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase">Last Contact</p>
                <p className="text-gray-900 font-medium mt-1">{lead.lastContact}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Next Follow-up</p>
                <p className="text-primary-600 font-medium mt-1">{lead.nextFollowUp}</p>
              </div>
            </div>
          </div>

          {/* Assigned Agent */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Assigned To</h3>
            <p className="text-sm text-gray-900 font-medium">{lead.assignedTo}</p>
            <button className="mt-4 w-full text-xs text-primary-600 border border-primary-200 hover:bg-primary-50 rounded-lg py-2 font-medium transition">
              Reassign Lead
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 text-xs px-3 py-2.5 border border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 font-medium transition">
              Update Stage
            </button>
            <button className="flex-1 text-xs px-3 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition">
              Close Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
