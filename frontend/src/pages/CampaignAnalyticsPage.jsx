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

export default function CampaignAnalyticsPage() {
  const { id } = useParams()
  const campaign = useMemo(() => getCampaignById(id), [id])

  if (!campaign) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-gray-900">Campaign not found</h1>
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

  const ctr = percent(totals.clicks, totals.impressions)
  const leadRate = percent(totals.leads, totals.clicks)
  const conversionRate = percent(totals.conversions, totals.leads)
  const cpl = totals.leads ? totals.spend / totals.leads : 0
  const cpa = totals.conversions ? totals.spend / totals.conversions : 0

  const topLeadType = [...campaign.mediaPerformance].sort((a, b) => b.leads - a.leads)[0]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Overall analytics for {campaign.name}.</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/marketing/campaigns/${campaign.id}`} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
            View Campaign
          </Link>
          <Link to={`/marketing/campaigns/${campaign.id}/settings`} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
            Campaign Settings
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">CTR</p><p className="text-2xl font-bold text-gray-900 mt-1">{ctr.toFixed(2)}%</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Lead Rate</p><p className="text-2xl font-bold text-gray-900 mt-1">{leadRate.toFixed(2)}%</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Conversion Rate</p><p className="text-2xl font-bold text-gray-900 mt-1">{conversionRate.toFixed(2)}%</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">CPL</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(cpl)}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">CPA</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(cpa)}</p></div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-800">Channel Contribution</h2>
        {campaign.mediaPerformance.map((item) => {
          const leadShare = percent(item.leads, totals.leads || 1)
          return (
            <div key={item.type}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700">{item.type}</span>
                <span className="text-gray-500">{item.leads} leads ({leadShare.toFixed(1)}%)</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-primary-500" style={{ width: `${Math.min(100, leadShare)}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-800">Insights</h2>
        <ul className="mt-3 text-sm text-gray-600 space-y-2">
          <li>Top performing media by leads: <span className="font-medium text-gray-800">{topLeadType?.type || '-'}</span></li>
          <li>Total spend across selected media: <span className="font-medium text-gray-800">{formatCurrency(totals.spend)}</span></li>
          <li>Total conversions across selected media: <span className="font-medium text-gray-800">{totals.conversions}</span></li>
        </ul>
      </div>
    </div>
  )
}
