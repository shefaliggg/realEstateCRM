import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getChannelPartnerById } from '../api/channelPartnerApi'

function inr(value) {
  return `INR ${Number(value || 0).toLocaleString()}`
}

export default function PartnerProfilePage() {
  const { id } = useParams()
  const [partner, setPartner] = useState(null)
  const [leads, setLeads] = useState([])
  const [deals, setDeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    getChannelPartnerById(id)
      .then((data) => {
        setPartner(data.partner)
        setLeads(data.leads)
        setDeals(data.deals)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  const projectHistory = useMemo(() => {
    const projectMap = new Map()

    deals.forEach((deal) => {
      const key = deal.unit?.project?.name || 'Unknown Project'
      const current = projectMap.get(key) || {
        projectName: key,
        dealCount: 0,
        totalCommission: 0,
        paidCommission: 0,
        pendingCommission: 0,
      }
      current.dealCount += 1
      current.totalCommission += Number(deal.commission || 0)
      if (deal.commissionStatus === 'Paid') {
        current.paidCommission += Number(deal.commission || 0)
      } else {
        current.pendingCommission += Number(deal.commission || 0)
      }
      projectMap.set(key, current)
    })

    return Array.from(projectMap.values()).sort((a, b) => b.totalCommission - a.totalCommission)
  }, [deals])

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>

  if (notFound || !partner) {
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
    totalCommission: deals.reduce((a, d) => a + Number(d.commission || 0), 0),
    paidCommission: deals.filter((d) => d.commissionStatus === 'Paid').reduce((a, d) => a + Number(d.commission || 0), 0),
    pendingCommission: deals.filter((d) => d.commissionStatus !== 'Paid').reduce((a, d) => a + Number(d.commission || 0), 0),
    referrals: leads.length,
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
            <p className="text-sm font-medium text-gray-900 mt-1">{new Date(partner.joinedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Commission', val: inr(totals.totalCommission), color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Paid', val: inr(totals.paidCommission), color: 'bg-green-50 border-green-200 text-green-700' },
          { label: 'Pending', val: inr(totals.pendingCommission), color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
          { label: 'Referrals', val: totals.referrals, color: 'bg-gray-50 border-gray-200 text-gray-700' },
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
                <th className="px-4 py-3">Deal</th>
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Paid Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400">No commission history found</td>
                </tr>
              ) : (
                deals.map((row) => (
                  <tr key={row._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 font-medium">{row.dealName}</td>
                    <td className="px-4 py-3 text-gray-600">{row.unit?.project?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">{inr(row.commission)}</td>
                    <td className="px-4 py-3 text-gray-600">{row.commissionDueDate ? new Date(row.commissionDueDate).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${row.commissionStatus === 'Paid' ? 'bg-green-100 text-green-700' : row.commissionStatus === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {row.commissionStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{row.commissionPaidDate ? new Date(row.commissionPaidDate).toLocaleDateString() : '-'}</td>
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
                <th className="px-4 py-3">Deals</th>
                <th className="px-4 py-3">Total Commission</th>
                <th className="px-4 py-3">Pending Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {projectHistory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-400">No project history found</td>
                </tr>
              ) : (
                projectHistory.map((row) => (
                  <tr key={row.projectName} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 font-medium">{row.projectName}</td>
                    <td className="px-4 py-3 text-gray-600">{row.dealCount}</td>
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
