import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { suggestLeadFollowUp } from '../api/aiApi'

const NURTURE_STAGES = ['Cold', 'Warm', 'Interested', 'Very Interested', 'Nurtured']

const STAGE_STYLES = {
  Cold: 'bg-slate-100 text-slate-700',
  Warm: 'bg-yellow-100 text-yellow-700',
  Interested: 'bg-orange-100 text-orange-700',
  'Very Interested': 'bg-red-100 text-red-700',
  Nurtured: 'bg-green-100 text-green-700',
}

const TASK_TYPES = ['Call', 'Email', 'Site Visit', 'Follow-up', 'Meeting', 'WhatsApp']

function StarScore({ score }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-base ${i <= score ? 'text-yellow-400' : 'text-gray-200'}`}>★</span>
      ))}
    </div>
  )
}

export default function LeadDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [lead, setLead] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [noteText, setNoteText] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [taskForm, setTaskForm] = useState({ type: 'Call', note: '', dueDate: '' })
  const [addingTask, setAddingTask] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [updatingStage, setUpdatingStage] = useState(false)
  const [updatingScore, setUpdatingScore] = useState(false)
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    api.get(`/leads/${id}`)
      .then(r => setLead(r.data))
      .catch(() => setError('Failed to load lead'))
      .finally(() => setLoading(false))
  }, [id])

  const handleStageChange = async stage => {
    setUpdatingStage(true)
    try {
      const res = await api.put(`/leads/${id}`, { nurtureStage: stage })
      setLead(res.data)
    } catch { /* ignore */ }
    finally { setUpdatingStage(false) }
  }

  const handleScoreChange = async score => {
    setUpdatingScore(true)
    try {
      const res = await api.put(`/leads/${id}`, { leadScore: score })
      setLead(res.data)
    } catch { /* ignore */ }
    finally { setUpdatingScore(false) }
  }

  const handleSuggestFollowUp = async () => {
    setAiLoading(true)
    try {
      const { suggestion } = await suggestLeadFollowUp(id)
      setAiSuggestion(suggestion)
    } catch {
      setAiSuggestion('Could not get a suggestion right now.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleAddNote = async e => {
    e.preventDefault()
    if (!noteText.trim()) return
    setAddingNote(true)
    try {
      const res = await api.post(`/leads/${id}/notes`, { text: noteText })
      setLead(res.data)
      setNoteText('')
    } catch { /* ignore */ }
    finally { setAddingNote(false) }
  }

  const handleAddTask = async e => {
    e.preventDefault()
    if (!taskForm.type) return
    setAddingTask(true)
    try {
      const res = await api.post(`/leads/${id}/tasks`, taskForm)
      setLead(res.data)
      setTaskForm({ type: 'Call', note: '', dueDate: '' })
      setShowTaskForm(false)
    } catch { /* ignore */ }
    finally { setAddingTask(false) }
  }

  const handleCompleteTask = async taskId => {
    try {
      const res = await api.put(`/leads/${id}/tasks/${taskId}/complete`)
      setLead(res.data)
    } catch { /* ignore */ }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this lead? This cannot be undone.')) return
    try {
      await api.delete(`/leads/${id}`)
      navigate('/leads')
    } catch {
      alert('Failed to delete lead')
    }
  }

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!lead) return null

  const pendingTasks = lead.followUpTasks?.filter(t => !t.completed) || []
  const completedTasks = lead.followUpTasks?.filter(t => t.completed) || []

  return (
          <div className="p-6 max-w-3xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/leads" className="hover:text-primary-600">Leads</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{lead.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
          </div>
          <button onClick={handleDelete} className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors">
            Delete Lead
          </button>
        </div>

        {/* Nurture Stage */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">🎯 Nurture Stage</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {NURTURE_STAGES.map(s => (
              <button
                key={s}
                onClick={() => handleStageChange(s)}
                disabled={updatingStage}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                  lead.nurtureStage === s
                    ? `${STAGE_STYLES[s]} border-current`
                    : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5">Lead Score</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  onClick={() => handleScoreChange(i)}
                  disabled={updatingScore}
                  className={`text-xl transition-transform hover:scale-110 disabled:opacity-50 ${i <= (lead.leadScore || 0) ? 'text-yellow-400' : 'text-gray-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
          <h3 className="font-semibold text-gray-800 mb-3">📋 Details</h3>
          <dl className="grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
            <div><dt className="text-gray-500">Source</dt><dd className="font-medium mt-0.5">{lead.source || '—'}</dd></div>
            <div><dt className="text-gray-500">Budget</dt><dd className="font-medium mt-0.5">{lead.budget ? `₹${(lead.budget / 100000).toFixed(0)}L` : '—'}</dd></div>
            <div><dt className="text-gray-500">City</dt><dd className="font-medium mt-0.5">{lead.city || '—'}</dd></div>
            <div><dt className="text-gray-500">Next Follow-up</dt><dd className="font-medium mt-0.5">{lead.nextFollowUpDate ? new Date(lead.nextFollowUpDate).toLocaleDateString() : '—'}</dd></div>
            {lead.requirements && (
              <div className="col-span-2"><dt className="text-gray-500">Requirements</dt><dd className="font-medium mt-0.5">{lead.requirements}</dd></div>
            )}
          </dl>
        </div>

        {/* AI Follow-up Suggestion */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">✨ AI Follow-up Suggestion</h3>
            <button
              onClick={handleSuggestFollowUp}
              disabled={aiLoading}
              className="text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {aiLoading ? 'Thinking…' : 'Suggest Follow-up (AI)'}
            </button>
          </div>
          {aiSuggestion && (
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{aiSuggestion}</p>
          )}
        </div>

        {/* Unit Interest */}
        {lead.unitInterest?.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
            <h3 className="font-semibold text-gray-800 mb-3">🏠 Interested Units</h3>
            <div className="space-y-2">
              {lead.unitInterest.map(u => (
                <Link key={u._id || u} to={`/units/${u._id || u}`}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-primary-50 transition-colors text-sm">
                  <span className="font-medium">Tower {u.block} – {u.unitNo}</span>
                  <span className="text-gray-400">{u.bhkType}</span>
                  {u.status && (
                    <span className="ml-auto text-xs bg-white border px-2 py-0.5 rounded-full">{u.status}</span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Follow-up Tasks */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">📅 Follow-up Tasks</h3>
            <button onClick={() => setShowTaskForm(v => !v)}
              className="text-sm text-primary-600 hover:underline">
              {showTaskForm ? 'Cancel' : '+ Add Task'}
            </button>
          </div>

          {showTaskForm && (
            <form onSubmit={handleAddTask} className="bg-gray-50 rounded-lg p-3 mb-3 space-y-2">
              <div className="flex gap-2">
                <select value={taskForm.type} onChange={e => setTaskForm(f => ({ ...f, type: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 flex-1">
                  {TASK_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
                <input type="date" value={taskForm.dueDate} onChange={e => setTaskForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 flex-1" />
              </div>
              <input value={taskForm.note} onChange={e => setTaskForm(f => ({ ...f, note: e.target.value }))}
                placeholder="Note (optional)"
                className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              <button type="submit" disabled={addingTask}
                className="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
                {addingTask ? 'Adding...' : 'Add Task'}
              </button>
            </form>
          )}

          {pendingTasks.length === 0 && completedTasks.length === 0 && (
            <p className="text-sm text-gray-400">No tasks yet</p>
          )}

          <div className="space-y-2">
            {pendingTasks.map(t => (
              <div key={t._id} className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100">
                <button onClick={() => handleCompleteTask(t._id)}
                  className="w-5 h-5 rounded border-2 border-gray-300 hover:border-green-400 flex-shrink-0 transition-colors" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-800">{t.type}</span>
                  {t.note && <p className="text-xs text-gray-500 truncate">{t.note}</p>}
                </div>
                {t.dueDate && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    new Date(t.dueDate) < new Date() ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {new Date(t.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
            {completedTasks.map(t => (
              <div key={t._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 opacity-60">
                <span className="w-5 h-5 rounded bg-green-400 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </span>
                <span className="text-sm text-gray-500 line-through">{t.type}</span>
                {t.note && <span className="text-xs text-gray-400 truncate">{t.note}</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-3">📝 Notes</h3>
          <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
            <input value={noteText} onChange={e => setNoteText(e.target.value)}
              placeholder="Add a note..."
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
            <button type="submit" disabled={addingNote || !noteText.trim()}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
              {addingNote ? '...' : 'Add'}
            </button>
          </form>
          {lead.notes?.length === 0 && <p className="text-sm text-gray-400">No notes yet</p>}
          <div className="space-y-3">
            {[...(lead.notes || [])].reverse().map((n, i) => (
              <div key={i} className="border-l-2 border-primary-200 pl-3">
                <p className="text-sm text-gray-800">{n.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {n.authorName || 'You'} · {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      )
}
