import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function SiteVisitSchedulePage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({
    leadId: '',
    visitDate: '',
    visitTime: '',
    note: '',
  })

  useEffect(() => {
    api.get('/leads')
      .then((res) => setLeads(res.data || []))
      .catch(() => setError('Failed to load leads'))
      .finally(() => setLoading(false))
  }, [])

  const visitRows = useMemo(() => {
    const rows = []
    leads.forEach((lead) => {
      ;(lead.followUpTasks || []).forEach((task) => {
        if (task.type !== 'Site Visit') return
        rows.push({
          leadId: lead._id,
          leadName: lead.name,
          leadPhone: lead.phone,
          leadEmail: lead.email,
          taskId: task._id,
          note: task.note,
          dueDate: task.dueDate,
          completed: Boolean(task.completed),
        })
      })
    })
    return rows.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  }, [leads])

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return visitRows
    return visitRows.filter((row) => {
      return (
        row.leadName?.toLowerCase().includes(q)
        || row.leadPhone?.toLowerCase().includes(q)
        || row.leadEmail?.toLowerCase().includes(q)
        || row.note?.toLowerCase().includes(q)
      )
    })
  }, [search, visitRows])

  const handleSchedule = async (e) => {
    e.preventDefault()
    setError('')

    if (!form.leadId || !form.visitDate || !form.visitTime) {
      setError('Lead, date, and time are required')
      return
    }

    const dueDate = new Date(`${form.visitDate}T${form.visitTime}`)
    if (Number.isNaN(dueDate.getTime())) {
      setError('Please select a valid date and time')
      return
    }

    setSaving(true)
    try {
      await api.post(`/leads/${form.leadId}/tasks`, {
        type: 'Site Visit',
        dueDate: dueDate.toISOString(),
        note: form.note,
      })
      await api.put(`/leads/${form.leadId}`, {
        nextFollowUpDate: dueDate.toISOString(),
      })

      const refreshed = await api.get('/leads')
      setLeads(refreshed.data || [])
      setForm({ leadId: '', visitDate: '', visitTime: '', note: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to schedule site visit')
    } finally {
      setSaving(false)
    }
  }

  const markCompleted = async (leadId, taskId) => {
    try {
      await api.put(`/leads/${leadId}/tasks/${taskId}/complete`)
      const refreshed = await api.get('/leads')
      setLeads(refreshed.data || [])
    } catch {
      setError('Failed to mark visit as completed')
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule Site Visit</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage lead site visit appointments.</p>
        </div>
        <Link
          to="/visits/calendar"
          className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Open Calendar
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSchedule} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <h2 className="font-semibold text-gray-800">New Visit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="xl:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Lead</label>
            <select
              value={form.leadId}
              onChange={(e) => setForm((f) => ({ ...f, leadId: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              disabled={loading || saving}
            >
              <option value="">Select lead</option>
              {leads.map((lead) => (
                <option key={lead._id} value={lead._id}>{lead.name} {lead.phone ? `- ${lead.phone}` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={form.visitDate}
              onChange={(e) => setForm((f) => ({ ...f, visitDate: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              disabled={saving}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="time"
              value={form.visitTime}
              onChange={(e) => setForm((f) => ({ ...f, visitTime: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              disabled={saving}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
          <textarea
            rows={3}
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder="Meeting point, preferred unit, special instructions..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
            disabled={saving}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-60 transition-colors"
        >
          {saving ? 'Scheduling...' : 'Schedule Visit'}
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 className="font-semibold text-gray-800">Scheduled Visits</h2>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by lead, phone, email..."
            className="w-full sm:w-72 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>

        {loading ? (
          <div className="text-gray-400 text-sm py-8 text-center">Loading visits...</div>
        ) : filteredRows.length === 0 ? (
          <div className="text-gray-400 text-sm py-8 text-center">No site visits found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100">
                  <th className="py-3 pr-3">Lead</th>
                  <th className="py-3 pr-3">Visit Date</th>
                  <th className="py-3 pr-3">Note</th>
                  <th className="py-3 pr-3">Status</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRows.map((row) => (
                  <tr key={row.taskId} className="hover:bg-gray-50">
                    <td className="py-3 pr-3">
                      <Link to={`/leads/${row.leadId}`} className="font-medium text-gray-900 hover:text-primary-600">
                        {row.leadName}
                      </Link>
                      <p className="text-xs text-gray-500">{row.leadPhone || row.leadEmail || '-'}</p>
                    </td>
                    <td className="py-3 pr-3 text-gray-700">{formatDateTime(row.dueDate)}</td>
                    <td className="py-3 pr-3 text-gray-600">{row.note || '-'}</td>
                    <td className="py-3 pr-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${row.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {row.completed ? 'Completed' : 'Scheduled'}
                      </span>
                    </td>
                    <td className="py-3">
                      {!row.completed && (
                        <button
                          type="button"
                          onClick={() => markCompleted(row.leadId, row.taskId)}
                          className="text-xs font-medium text-primary-600 hover:text-primary-700"
                        >
                          Mark Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
