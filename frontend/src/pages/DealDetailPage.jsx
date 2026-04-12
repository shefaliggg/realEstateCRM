import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const STAGES = ['Lead Qualification', 'Needs Analysis', 'Proposal Sent', 'Negotiation', 'Contract Review', 'Won', 'Lost']

const STAGE_STYLES = {
  'Lead Qualification': 'bg-blue-100 text-blue-700',
  'Needs Analysis': 'bg-purple-100 text-purple-700',
  'Proposal Sent': 'bg-yellow-100 text-yellow-700',
  'Negotiation': 'bg-orange-100 text-orange-700',
  'Contract Review': 'bg-pink-100 text-pink-700',
  'Won': 'bg-green-100 text-green-700',
  'Lost': 'bg-red-100 text-red-500',
}

const UNIT_STATUS_COLORS = {
  Available: 'bg-green-100 text-green-700',
  Reserved: 'bg-yellow-100 text-yellow-700',
  Booked: 'bg-orange-100 text-orange-700',
  Registered: 'bg-blue-100 text-blue-700',
}

export default function DealDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [deal, setDeal] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [noteText, setNoteText] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [updatingStage, setUpdatingStage] = useState(false)

  useEffect(() => {
    api.get(`/deals/${id}`)
      .then(r => setDeal(r.data))
      .catch(() => setError('Failed to load deal'))
      .finally(() => setLoading(false))
  }, [id])

  const handleStageChange = async stage => {
    setUpdatingStage(true)
    try {
      const res = await api.put(`/deals/${id}`, { stage })
      setDeal(res.data)
    } catch { /* ignore */ }
    finally { setUpdatingStage(false) }
  }

  const handleAddNote = async e => {
    e.preventDefault()
    if (!noteText.trim()) return
    setAddingNote(true)
    try {
      const res = await api.put(`/deals/${id}`, { notes: noteText })
      setDeal(res.data)
      setNoteText('')
    } catch { /* ignore */ }
    finally { setAddingNote(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this deal? This cannot be undone.')) return
    try {
      await api.delete(`/deals/${id}`)
      navigate('/deals')
    } catch {
      alert('Failed to delete deal')
    }
  }

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!deal) return null

  const unit = deal.unit
  const lead = deal.lead

  return (
          <div className="p-6 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/deals" className="hover:text-primary-600">Deals</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{deal.dealName}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{deal.dealName}</h1>
            <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${STAGE_STYLES[deal.stage] || 'bg-gray-100'}`}>
              {deal.stage}
            </span>
          </div>
          <button onClick={handleDelete}
            className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors">
            Delete Deal
          </button>
        </div>

        {/* Stage Stepper */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">📊 Deal Stage</h3>
          <div className="flex flex-wrap gap-2">
            {STAGES.map(s => (
              <button key={s} onClick={() => handleStageChange(s)} disabled={updatingStage}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  deal.stage === s ? `${STAGE_STYLES[s]} border-current` : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Unit Card */}
        {unit && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">🏠 Linked Unit</h3>
            <Link to={`/units/${unit._id}`}
              className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors">
              <div className="flex-1">
                <p className="font-medium text-gray-900">Block {unit.block} – Unit {unit.unitNo}</p>
                <p className="text-sm text-gray-500">Floor {unit.floor} · {unit.bhkType}{unit.carpetArea ? ` · ${unit.carpetArea} sqft` : ''}</p>
              </div>
              <div className="text-right">
                {unit.basePrice && <p className="font-medium text-gray-800">₹{(unit.basePrice / 100000).toFixed(1)}L</p>}
                <span className={`text-xs px-2 py-0.5 rounded-full ${UNIT_STATUS_COLORS[unit.status] || 'bg-gray-100'}`}>
                  {unit.status}
                </span>
              </div>
            </Link>
          </div>
        )}

        {/* Lead Card */}
        {lead && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">👤 Linked Lead</h3>
            <Link to={`/leads/${lead._id}`}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors">
              <div>
                <p className="font-medium text-gray-900">{lead.name}</p>
                <p className="text-sm text-gray-500">{lead.phone}</p>
              </div>
            </Link>
          </div>
        )}

        {/* Financials */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">💰 Financials</h3>
          <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
            <div><dt className="text-gray-500">Deal Value</dt><dd className="font-semibold mt-0.5 text-gray-900">{deal.value ? `₹${(deal.value / 100000).toFixed(2)}L` : '—'}</dd></div>
            <div><dt className="text-gray-500">Commission</dt><dd className="font-medium mt-0.5">{deal.commission ? `₹${(deal.commission / 100000).toFixed(2)}L` : '—'}</dd></div>
            <div><dt className="text-gray-500">Expected Close</dt><dd className="font-medium mt-0.5">{deal.closingDate ? new Date(deal.closingDate).toLocaleDateString() : '—'}</dd></div>
            <div><dt className="text-gray-500">Probability</dt><dd className="font-medium mt-0.5">{deal.probability ? `${deal.probability}%` : '—'}</dd></div>
          </dl>
        </div>

        {/* Activities */}
        {deal.activities?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">📋 Activity Log</h3>
            <div className="space-y-3">
              {[...deal.activities].reverse().map((a, i) => (
                <div key={i} className="border-l-2 border-primary-200 pl-3">
                  <p className="text-sm font-medium text-gray-800">{a.type}</p>
                  {a.note && <p className="text-xs text-gray-600">{a.note}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : ''}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">📝 Notes</h3>
          {deal.notes && <p className="text-sm text-gray-700 mb-4 whitespace-pre-line">{deal.notes}</p>}
          {deal.description && <p className="text-sm text-gray-500 italic">{deal.description}</p>}
        </div>
      </div>
      )
}
