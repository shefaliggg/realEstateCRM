import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'

const MOCK_DEALS = {
  1: {
    id: 1,
    dealName: 'Skyline Residency - 2BHK Apartment',
    property: 'Skyline Residency',
    lead: 'Ankit Joshi',
    stage: 'Proposal Sent',
    value: 5000000,
    commission: 150000,
    closingDate: '2026-05-15',
    probability: 75,
    owner: 'Rahul Sharma',
    created: '2026-03-20',
    description: 'Premium 2BHK apartment with modern amenities in prime South Mumbai location.',
    activities: [
      { date: '2026-04-12', type: 'Proposal Sent', note: 'Pricing proposal sent to lead' },
      { date: '2026-04-10', type: 'Meeting', note: 'Site visit completed, lead satisfied' },
      { date: '2026-04-05', type: 'Lead Contacted', note: 'Initial conversation with Ankit' },
    ],
  },
  2: {
    id: 2,
    dealName: 'Green Valley Villa - Premium 3BHK',
    property: 'Green Valley Villa',
    lead: 'Seema Patel',
    stage: 'Negotiation',
    value: 8500000,
    commission: 255000,
    closingDate: '2026-04-30',
    probability: 60,
    owner: 'Priya Mehta',
    created: '2026-03-18',
    description: '3BHK villa with private garden and modern amenities in Pune.',
    activities: [
      { date: '2026-04-08', type: 'Negotiation Started', note: 'Price negotiation ongoing' },
      { date: '2026-04-06', type: 'Meeting', note: 'Property tour with Seema' },
    ],
  },
}

const STAGE_STYLES = {
  'Lead Qualification': 'bg-blue-50 text-blue-700',
  'Needs Analysis': 'bg-cyan-50 text-cyan-700',
  'Proposal Sent': 'bg-amber-50 text-amber-700',
  'Negotiation': 'bg-orange-50 text-orange-700',
  'Contract Review': 'bg-purple-50 text-purple-700',
  'Won': 'bg-green-50 text-green-700',
  'Lost': 'bg-red-50 text-red-700',
}

export default function DealDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const deal = MOCK_DEALS[Number(id)]
  const [activeTab, setActiveTab] = useState('overview')

  if (!deal) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-400 text-sm mb-4">Deal not found.</p>
        <Link to="/deals" className="text-primary-600 text-sm font-medium hover:underline">
          Back to Deals
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <nav className="text-xs text-gray-400 mb-1">
              <Link to="/deals" className="hover:text-primary-600">
                Deals
              </Link>
              <span className="mx-1">/</span>
              <span className="text-gray-700">{deal.dealName}</span>
            </nav>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold text-gray-900">{deal.dealName}</h2>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STAGE_STYLES[deal.stage]}`}>
                {deal.stage}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition">
            Update Stage
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-100 p-1 w-fit">
            {['overview', 'timeline', 'documents'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium rounded transition ${
                  activeTab === tab
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'overview' ? 'Overview' : tab === 'timeline' ? 'Timeline' : 'Documents'}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-3">Deal Summary</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{deal.description}</p>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-bold text-gray-800 mb-4">Deal Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Property</p>
                    <p className="text-sm font-medium text-gray-900 mt-1">{deal.property}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Lead</p>
                    <Link to={`/leads/${deal.lead}`} className="text-sm font-medium text-primary-600 hover:underline mt-1">
                      {deal.lead}
                    </Link>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Deal Value</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">INR {(deal.value / 1000000).toFixed(1)} Cr</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Expected Commission</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">INR {(deal.commission / 100000).toFixed(2)} L</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline tab */}
          {activeTab === 'timeline' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Activity Timeline</h3>
              <div className="space-y-4">
                {deal.activities.map((activity, i) => (
                  <div key={i} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </div>
                      {i < deal.activities.length - 1 && <div className="w-0.5 h-8 bg-gray-200 mt-1" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-400">{activity.date}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-1">{activity.type}</p>
                      <p className="text-sm text-gray-600 mt-1">{activity.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents tab */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Documents</h3>
              <div className="grid grid-cols-2 gap-4">
                {['Agreement', 'Payment Receipt', 'ID Proof', 'Property Document'].map((doc) => (
                  <div
                    key={doc}
                    className="border border-gray-200 rounded-lg p-4 flex items-start justify-between hover:border-primary-300 transition cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <svg className="w-8 h-8 text-primary-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc}</p>
                        <p className="text-xs text-gray-400">Not yet uploaded</p>
                      </div>
                    </div>
                    <button className="text-primary-600 hover:text-primary-800 text-xs font-medium">Upload</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Deal Stats */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Deal Stats</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-gray-500 uppercase">Win Probability</span>
                  <span className="text-sm font-semibold text-gray-900">{deal.probability}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-600" style={{ width: `${deal.probability}%` }} />
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-gray-500 uppercase">Created</p>
                <p className="text-sm font-medium text-gray-900 mt-1">{deal.created}</p>
              </div>
            </div>
          </div>

          {/* Owner */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Deal Owner</h3>
            <p className="text-sm text-gray-900 font-medium">{deal.owner}</p>
            <button className="mt-4 w-full text-xs text-primary-600 border border-primary-200 hover:bg-primary-50 rounded-lg py-2 font-medium transition">
              Reassign Deal
            </button>
          </div>

          {/* Timeline Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-800 mb-3">Timeline</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 uppercase">Expected Closing</p>
                <p className="text-gray-900 font-medium mt-1">{deal.closingDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase">Days Remaining</p>
                <p className="text-primary-600 font-medium mt-1">
                  {Math.max(
                    0,
                    Math.ceil(
                      (new Date(deal.closingDate) - new Date()) / (1000 * 60 * 60 * 24)
                    )
                  )}
                  {' '}
                  days
                </p>
              </div>
            </div>
          </div>

          {/* Value Summary */}
          <div className="bg-primary-50 rounded-xl border border-primary-200 p-5">
            <h3 className="text-sm font-bold text-primary-900 mb-3">Deal Value At Stake</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-primary-700">Deal Value</span>
                <span className="font-bold text-primary-900">INR {(deal.value / 1000000).toFixed(1)} Cr</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-primary-700">Commission (3%)</span>
                <span className="font-bold text-primary-900">INR {(deal.commission / 100000).toFixed(2)} L</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button className="flex-1 text-xs px-3 py-2.5 border border-primary-200 text-primary-600 rounded-lg hover:bg-primary-50 font-medium transition">
              Move Stage
            </button>
            <button className="flex-1 text-xs px-3 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition">
              Mark Lost
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
