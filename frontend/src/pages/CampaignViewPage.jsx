import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCampaignById } from '../utils/marketingCampaignStore'

function percent(numerator, denominator) {
  if (!denominator) return 0
  return (numerator / denominator) * 100
}

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString()}`
}

export default function CampaignViewPage() {
  const { id } = useParams()
  const campaign = useMemo(() => getCampaignById(id), [id])

  if (!campaign) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-gray-900">Campaign not found</h1>
          <p className="text-sm text-gray-500 mt-2">This campaign may have been deleted or not created yet.</p>
          <Link to="/marketing/campaigns" className="inline-block mt-4 text-sm text-primary-600 hover:underline">
            Back to Campaigns
          </Link>
        </div>
      </div>
    )
  }

  const totals = campaign.mediaPerformance.reduce(
    (acc, item) => ({
      impressions: acc.impressions + item.impressions,
      clicks: acc.clicks + item.clicks,
      leads: acc.leads + item.leads,
      conversions: acc.conversions + item.conversions,
      spend: acc.spend + item.spend,
    }),
    { impressions: 0, clicks: 0, leads: 0, conversions: 0, spend: 0 }
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{campaign.name || 'Campaign View'}</h1>
          <p className="text-sm text-gray-500 mt-1">Selected media campaign status and performance numbers.</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/marketing/campaigns/${campaign.id}/settings`} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
            Campaign Settings
          </Link>
          <Link to={`/marketing/campaigns/${campaign.id}/analytics`} className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium">
            Campaign Analytics
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Impressions</p><p className="text-2xl font-bold text-gray-900 mt-1">{totals.impressions.toLocaleString()}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Clicks</p><p className="text-2xl font-bold text-gray-900 mt-1">{totals.clicks.toLocaleString()}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Leads</p><p className="text-2xl font-bold text-gray-900 mt-1">{totals.leads.toLocaleString()}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Conversions</p><p className="text-2xl font-bold text-gray-900 mt-1">{totals.conversions.toLocaleString()}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Spend</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totals.spend)}</p></div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Selected Media Campaigns</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Media Type</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Impressions</th>
                <th className="px-4 py-3 text-left font-medium">Clicks</th>
                <th className="px-4 py-3 text-left font-medium">Leads</th>
                <th className="px-4 py-3 text-left font-medium">Conversions</th>
                <th className="px-4 py-3 text-left font-medium">CTR</th>
                <th className="px-4 py-3 text-left font-medium">CPL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {campaign.mediaPerformance.map((item) => (
                <tr key={item.type}>
                  <td className="px-4 py-3 font-medium text-gray-800">{item.type}</td>
                  <td className="px-4 py-3 text-gray-700">{item.status}</td>
                  <td className="px-4 py-3 text-gray-600">{item.impressions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{item.clicks.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{item.leads.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{item.conversions.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-600">{percent(item.clicks, item.impressions).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-gray-600">{item.leads ? formatCurrency(item.spend / item.leads) : 'Rs 0'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
