import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

const STAGES = ['Cold', 'Warm', 'Interested', 'Very Interested', 'Nurtured']

const STAGE_STYLES = {
  Cold: { bg: 'bg-slate-50', header: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' },
  Warm: { bg: 'bg-yellow-50', header: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-400' },
  Interested: { bg: 'bg-orange-50', header: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
  'Very Interested': { bg: 'bg-red-50', header: 'bg-red-100 text-red-700', dot: 'bg-red-400' },
  Nurtured: { bg: 'bg-green-50', header: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
}

const SOURCE_COLORS = {
  'Walk-in': 'bg-blue-100 text-blue-700',
  'Website': 'bg-purple-100 text-purple-700',
  'Referral': 'bg-green-100 text-green-700',
  'Portal': 'bg-orange-100 text-orange-700',
}

function StarScore({ score }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-xs ${i <= score ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  )
}

function LeadCard({ lead, onStageChange }) {
  const [moving, setMoving] = useState(false)

  const moveToStage = async stage => {
    if (stage === lead.nurtureStage || moving) return
    setMoving(true)
    try {
      await api.put(`/leads/${lead._id}`, { nurtureStage: stage })
      onStageChange(lead._id, stage)
    } catch {
      // ignore
    } finally {
      setMoving(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-3 hover:shadow-md transition-shadow">
      {/* Name + Score */}
      <div className="flex items-start justify-between mb-1.5">
        <Link to={`/leads/${lead._id}`} className="font-medium text-gray-900 text-sm hover:text-primary-600 leading-tight">
          {lead.name}
        </Link>
        <StarScore score={lead.leadScore || 0} />
      </div>

      {/* Phone */}
      {lead.phone && <p className="text-xs text-gray-500 mb-2">{lead.phone}</p>}

      {/* Source + Budget */}
      <div className="flex flex-wrap gap-1.5 mb-2.5">
        {lead.source && (
          <span className={`text-xs px-2 py-0.5 rounded-full ${SOURCE_COLORS[lead.source] || 'bg-gray-100 text-gray-600'}`}>
            {lead.source}
          </span>
        )}
        {lead.budget && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            ₹{(lead.budget / 100000).toFixed(0)}L
          </span>
        )}
      </div>

      {/* Follow-up */}
      {lead.nextFollowUpDate && (
        <p className="text-xs text-primary-600 mb-2.5">
          📅 {new Date(lead.nextFollowUpDate).toLocaleDateString()}
        </p>
      )}

      {/* Move to stage */}
      <div className="flex gap-1 flex-wrap">
        {STAGES.filter(s => s !== lead.nurtureStage).map(s => (
          <button
            key={s}
            onClick={() => moveToStage(s)}
            disabled={moving}
            className="text-xs text-gray-400 hover:text-primary-600 hover:bg-primary-50 px-1.5 py-0.5 rounded transition-colors disabled:opacity-40"
            title={`Move to ${s}`}
          >
            → {s}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function LeadNurturePage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/leads')
      .then(r => setLeads(r.data))
      .catch(() => setError('Failed to load leads'))
      .finally(() => setLoading(false))
  }, [])

  const handleStageChange = (leadId, newStage) => {
    setLeads(prev => prev.map(l => l._id === leadId ? { ...l, nurtureStage: newStage } : l))
  }

  const filtered = search
    ? leads.filter(l => l.name?.toLowerCase().includes(search.toLowerCase()) || l.phone?.includes(search))
    : leads

  const byStage = stage => filtered.filter(l => l.nurtureStage === stage)

  return (
          <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lead Nurture Board</h1>
          </div>
          <Link
            to="/leads/add"
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Add Lead
          </Link>
        </div>

        {/* Search */}
        <div className="mb-5">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search leads..."
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-300 w-64"
          />
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">{error}</div>}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading leads...</div>
        ) : (
          /* Kanban Board */
          <div className="flex gap-4 overflow-x-auto pb-4">
            {STAGES.map(stage => {
              const stageLeads = byStage(stage)
              const style = STAGE_STYLES[stage]
              return (
                <div key={stage} className={`flex-shrink-0 w-64 rounded-xl ${style.bg}`}>
                  {/* Column Header */}
                  <div className={`${style.header} rounded-t-xl px-3 py-2.5 flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${style.dot}`} />
                      <span className="font-semibold text-sm">{stage}</span>
                    </div>
                    <span className="text-xs font-bold bg-white bg-opacity-60 px-2 py-0.5 rounded-full">
                      {stageLeads.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="p-2 space-y-2 min-h-[200px]">
                    {stageLeads.map(lead => (
                      <LeadCard key={lead._id} lead={lead} onStageChange={handleStageChange} />
                    ))}
                    {stageLeads.length === 0 && (
                      <div className="text-center py-6 text-gray-300 text-xs">No leads</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-500 border-t border-gray-100 pt-4">
          <span className="font-medium text-gray-600">Stages:</span>
          {STAGES.map((s, i) => (
            <span key={s}>
              {s}
              {i < STAGES.length - 1 && <span className="ml-3 text-gray-300">→</span>}
            </span>
          ))}
        </div>
      </div>
      )
}
