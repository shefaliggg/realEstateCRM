import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getPartnerLeads, getPartnerTeam, assignPartnerLead } from '../../api/partnerApi'

export default function PartnerMyLeadsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'partner_admin' || user?.role === 'builder_admin'

  const [leads, setLeads] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigningId, setAssigningId] = useState(null)

  const refreshLeads = () => getPartnerLeads().then(setLeads)

  useEffect(() => {
    Promise.all([refreshLeads(), isAdmin ? getPartnerTeam() : Promise.resolve([])])
      .then(([, team]) => setAgents(team.filter((m) => m.role === 'partner_agent')))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onAssign = async (leadId, agentUserId) => {
    setAssigningId(leadId)
    try {
      await assignPartnerLead(leadId, agentUserId || null)
      await refreshLeads()
    } finally {
      setAssigningId(null)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
          <p className="text-sm text-gray-500 mt-1">Leads you've referred.</p>
        </div>
        <Link to="/partner/leads/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Register Lead
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Registered</th>
                {isAdmin && <th className="px-4 py-3">Assigned To</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={isAdmin ? 6 : 5} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={isAdmin ? 6 : 5} className="px-4 py-12 text-center text-gray-400">No leads registered yet</td></tr>
              ) : (
                leads.map((l) => (
                  <tr key={l._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{l.name}</p>
                      <p className="text-xs text-gray-500">{l.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">{l.nurtureStage || 'Cold'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{l.budget ? `₹${(l.budget / 100000).toFixed(0)}L` : '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{l.project?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(l.createdAt).toLocaleDateString()}</td>
                    {isAdmin && (
                      <td className="px-4 py-3">
                        <select
                          className="input-field text-xs py-1"
                          value={l.assignedTo || ''}
                          disabled={assigningId === l._id}
                          onChange={(e) => onAssign(l._id, e.target.value)}
                        >
                          <option value="">Unassigned</option>
                          {agents.map((a) => (
                            <option key={a.user?._id} value={a.user?._id}>{a.user?.name}</option>
                          ))}
                        </select>
                      </td>
                    )}
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
