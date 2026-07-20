import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { formatDate, formatPrice } from './shared'

const STAGE_COLORS = {
  Cold: 'bg-gray-100 text-gray-600',
  Warm: 'bg-yellow-100 text-yellow-700',
  Interested: 'bg-blue-100 text-blue-700',
  'Very Interested': 'bg-orange-100 text-orange-700',
  Nurtured: 'bg-green-100 text-green-700',
}

function ScheduleVisitButton({ lead, onScheduled }) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!date || busy) return
    setBusy(true)
    try {
      await api.post(`/leads/${lead._id}/tasks`, { type: 'Site Visit', dueDate: date })
      setOpen(false)
      setDate('')
      onScheduled?.()
    } catch {
      // no-op — inline errors intentionally suppressed to keep the row compact
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="text-xs font-medium text-primary-600 hover:text-primary-700">
        Schedule Visit
      </button>
    )
  }
  return (
    <div className="flex items-center gap-1">
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="text-xs border border-gray-200 rounded px-1.5 py-1" />
      <button onClick={submit} disabled={busy || !date} className="text-xs font-medium text-white bg-primary-600 rounded px-2 py-1 disabled:opacity-50">✓</button>
      <button onClick={() => setOpen(false)} className="text-xs text-gray-400">✕</button>
    </div>
  )
}

export default function LeadsTab({ id, leads, onLeadsChanged }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link to={`/leads/add?project=${id}`} className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
          + Add Lead
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Lead</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Phone</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Budget</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Source</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Status</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Assigned To</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map((lead) => (
                <tr key={lead._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <Link to={`/leads/${lead._id}`} className="font-medium text-gray-900 hover:text-primary-600">{lead.name}</Link>
                    <p className="text-xs text-gray-400">{formatDate(lead.createdAt)}</p>
                  </td>
                  <td className="px-2 py-2.5 text-gray-600">{lead.phone}</td>
                  <td className="px-2 py-2.5 text-gray-600">{lead.budget ? formatPrice(lead.budget) : '—'}</td>
                  <td className="px-2 py-2.5 text-gray-600">{lead.source}</td>
                  <td className="px-2 py-2.5">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STAGE_COLORS[lead.nurtureStage] || 'bg-gray-100'}`}>{lead.nurtureStage}</span>
                  </td>
                  <td className="px-2 py-2.5 text-gray-600">{lead.assignedTo?.name || 'Unassigned'}</td>
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-2">
                      <a href={`tel:${lead.phone}`} className="text-xs font-medium text-green-600 hover:text-green-700">📞 Call</a>
                      <a href={`https://wa.me/${(lead.phone || '').replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-xs font-medium text-emerald-600 hover:text-emerald-700">💬 WhatsApp</a>
                      <ScheduleVisitButton lead={lead} onScheduled={onLeadsChanged} />
                    </div>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-gray-400">No leads linked to this project yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
