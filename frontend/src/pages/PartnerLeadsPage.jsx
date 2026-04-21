import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { getPartnerLeadLinks, getPartners, savePartnerLeadLinks } from '../utils/channelPartnerStore'

const PARTNER_SOURCES = ['Referral', 'Direct']

export default function PartnerLeadsPage() {
  const [leads, setLeads] = useState([])
  const [partners] = useState(getPartners())
  const [links, setLinks] = useState(getPartnerLeadLinks())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('All')

  useEffect(() => {
    api.get('/leads')
      .then((r) => setLeads(r.data || []))
      .catch(() => setError('Failed to load leads'))
      .finally(() => setLoading(false))
  }, [])

  const mappedLeads = useMemo(() => {
    return leads
      .filter((l) => PARTNER_SOURCES.includes(l.source))
      .map((l) => {
        const link = links.find((x) => x.leadId === l._id)
        const partner = partners.find((p) => p.id === link?.partnerId)
        return {
          ...l,
          partnerId: link?.partnerId || '',
          partnerName: partner?.name || 'Unassigned',
        }
      })
  }, [leads, links, partners])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return mappedLeads.filter((l) => {
      if (stageFilter !== 'All' && (l.nurtureStage || 'Cold') !== stageFilter) return false
      if (!q) return true
      return (
        l.name?.toLowerCase().includes(q)
        || l.phone?.toLowerCase().includes(q)
        || l.email?.toLowerCase().includes(q)
        || l.partnerName?.toLowerCase().includes(q)
      )
    })
  }, [mappedLeads, search, stageFilter])

  const stages = useMemo(() => {
    const set = new Set(mappedLeads.map((l) => l.nurtureStage || 'Cold'))
    return ['All', ...Array.from(set)]
  }, [mappedLeads])

  const stats = {
    total: mappedLeads.length,
    assigned: mappedLeads.filter((l) => l.partnerId).length,
    unassigned: mappedLeads.filter((l) => !l.partnerId).length,
    convertedLike: mappedLeads.filter((l) => (l.nurtureStage || '').toLowerCase().includes('interested')).length,
  }

  const assignPartner = (leadId, partnerId) => {
    const rest = links.filter((x) => x.leadId !== leadId)
    const next = partnerId ? [...rest, { leadId, partnerId }] : rest
    setLinks(next)
    savePartnerLeadLinks(next)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Partner Leads</h1>
        <p className="text-sm text-gray-500 mt-1">Track leads received via referral/direct channels and assign them to partners.</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Partner Leads', val: stats.total, color: 'bg-gray-50 border-gray-200 text-gray-700' },
          { label: 'Assigned', val: stats.assigned, color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Unassigned', val: stats.unassigned, color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Interested+', val: stats.convertedLike, color: 'bg-blue-50 border-blue-200 text-blue-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="text-2xl font-bold leading-tight">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by lead, phone, email, partner..."
          className="flex-1 min-w-[240px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        />
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
        >
          {stages.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Lead</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Stage</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Assigned Partner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">Loading partner leads...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">No partner leads found</td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link to={`/leads/${l._id}`} className="font-semibold text-gray-900 hover:text-primary-600">{l.name}</Link>
                      <p className="text-xs text-gray-500">{l.phone || l.email || '-'}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{l.source || '-'}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">{l.nurtureStage || 'Cold'}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{l.budget ? `INR ${Number(l.budget).toLocaleString()}` : '-'}</td>
                    <td className="px-4 py-3">
                      <select
                        value={l.partnerId}
                        onChange={(e) => assignPartner(l._id, e.target.value)}
                        className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300"
                      >
                        <option value="">Unassigned</option>
                        {partners.filter((p) => p.active).map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
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
