import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPartnerLeads } from '../../api/partnerApi'

export default function PartnerSiteVisitsPage() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPartnerLeads().then(setLeads).finally(() => setLoading(false))
  }, [])

  const visits = useMemo(() => {
    return leads.flatMap((lead) =>
      (lead.followUpTasks || [])
        .filter((t) => t.type === 'Site Visit')
        .map((t) => ({ ...t, leadId: lead._id, leadName: lead.name, leadPhone: lead.phone }))
    ).sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))
  }, [leads])

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Site Visits</h1>
        <p className="text-sm text-gray-500 mt-1">Site visit tasks logged against your leads.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Note</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : visits.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400">No site visits scheduled</td></tr>
              ) : (
                visits.map((v, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to="/partner/leads" className="font-semibold text-gray-900 hover:text-primary-600">{v.leadName}</Link>
                      <p className="text-xs text-gray-500">{v.leadPhone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{v.note || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{v.dueDate ? new Date(v.dueDate).toLocaleString() : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${v.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {v.completed ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
