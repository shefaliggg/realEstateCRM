import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'
import { getPartnerLeadLinks, getPartnerPayouts, getPartners } from '../utils/channelPartnerStore'

function inr(value) {
  return `INR ${Number(value || 0).toLocaleString()}`
}

export default function PartnerProfilePage() {
  const { id } = useParams()
  const [partners] = useState(getPartners())
  const [payouts] = useState(getPartnerPayouts())
  const [links] = useState(getPartnerLeadLinks())
  const [leads, setLeads] = useState([])
  const [loadingLeads, setLoadingLeads] = useState(true)

  useEffect(() => {
    api.get('/leads')
      .then((r) => setLeads(r.data || []))
      .catch(() => setLeads([]))
      .finally(() => setLoadingLeads(false))
  }, [])

  const partner = partners.find((p) => p.id === id)

  const commissionHistory = useMemo(() => {
    return payouts
      .filter((p) => p.partnerId === id)
      .sort((a, b) => new Date(b.dueDate) - new Date(a.dueDate))
  }, [payouts, id])

  const leadHistory = useMemo(() => {
    const leadIds = links.filter((x) => x.partnerId === id).map((x) => x.leadId)
    const assignedLeads = leads.filter((l) => leadIds.includes(l._id))
    return assignedLeads
  }, [links, leads, id])

  const projectHistory = useMemo(() => {
    const projectMap = new Map()

    commissionHistory.forEach((entry) => {
      const key = entry.projectName || 'Unknown Project'
      const current = projectMap.get(key) || {
        projectName: key,
        payoutCount: 0,
        totalCommission: 0,
        paidCommission: 0,
        pendingCommission: 0,
        referredLeads: 0,
        interestedLeads: 0,
      }
      current.payoutCount += 1
      current.totalCommission += Number(entry.amount || 0)
      if (entry.status === 'Paid') {
        current.paidCommission += Number(entry.amount || 0)
      } else {
        current.pendingCommission += Number(entry.amount || 0)
      }
      projectMap.set(key, current)
    })

    const fallbackKey = 'Unmapped Referrals'
    leadHistory.forEach((lead) => {
      const bucket = projectMap.get(fallbackKey) || {
        projectName: fallbackKey,
        payoutCount: 0,
        totalCommission: 0,
        paidCommission: 0,
        pendingCommission: 0,
        referredLeads: 0,
        interestedLeads: 0,
      }
      bucket.referredLeads += 1
      if (['Interested', 'Very Interested', 'Nurtured'].includes(lead.nurtureStage)) {
        bucket.interestedLeads += 1
      }
      projectMap.set(fallbackKey, bucket)
    })

    return Array.from(projectMap.values()).sort((a, b) => b.totalCommission - a.totalCommission)
  }, [commissionHistory, leadHistory])

  if (!partner) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Partner not found</h1>
          <Link to="/partners" className="text-primary-600 hover:text-primary-700 text-sm font-medium">Back to Partners</Link>
        </div>
      </div>
    )
  }

  const totals = {
    totalCommission: commissionHistory.reduce((a, p) => a + Number(p.amount || 0), 0),
    paidCommission: commissionHistory.filter((p) => p.status === 'Paid').reduce((a, p) => a + Number(p.amount || 0), 0),
    pendingCommission: commissionHistory.filter((p) => p.status !== 'Paid').reduce((a, p) => a + Number(p.amount || 0), 0),
    referrals: leadHistory.length,
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm text-gray-500 mb-1">
            <Link to="/partners" className="hover:text-primary-600">Channel Partners</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-800">Profile</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{partner.name}</h1>
          <p className="text-sm text-gray-500 mt-1">Partner profile, commission history, and project managed history.</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${partner.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
          {partner.active ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-500">Contact Person</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{partner.contactPerson}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Phone</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{partner.phone}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{partner.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">City</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{partner.city || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Commission Rate</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{partner.commissionRate}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Joined</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{partner.joinedAt}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Commission', val: inr(totals.totalCommission), color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Paid', val: inr(totals.paidCommission), color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Pending', val: inr(totals.pendingCommission), color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Referrals', val: loadingLeads ? '...' : totals.referrals, color: 'bg-gray-50 border-gray-200 text-gray-700' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="text-lg sm:text-xl font-bold leading-tight">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Commission History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Deal Ref</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Paid Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {commissionHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">No commission history found</td>
                </tr>
              ) : (
                commissionHistory.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 font-medium">{row.dealRef}</td>
                    <td className="px-4 py-3 text-gray-600">{row.projectName}</td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">{inr(row.amount)}</td>
                    <td className="px-4 py-3 text-gray-600">{row.dueDate}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${row.status === 'Paid' ? 'bg-green-100 text-green-700' : row.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.paidDate || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Project Managed History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Payout Entries</th>
                <th className="px-4 py-3">Referred Leads</th>
                <th className="px-4 py-3">Interested Leads</th>
                <th className="px-4 py-3">Total Commission</th>
                <th className="px-4 py-3">Pending Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projectHistory.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">No project history found</td>
                </tr>
              ) : (
                projectHistory.map((row) => (
                  <tr key={row.projectName} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 font-medium">{row.projectName}</td>
                    <td className="px-4 py-3 text-gray-600">{row.payoutCount}</td>
                    <td className="px-4 py-3 text-gray-600">{row.referredLeads}</td>
                    <td className="px-4 py-3 text-gray-600">{row.interestedLeads}</td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">{inr(row.totalCommission)}</td>
                    <td className="px-4 py-3 text-yellow-700 font-semibold">{inr(row.pendingCommission)}</td>
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
