import { Link } from 'react-router-dom'
import { getCampaigns } from '../utils/marketingCampaignStore'

function formatDate(value) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return parsed.toLocaleDateString()
}

export default function EmailCampaignsPage() {
  const emailCampaigns = getCampaigns().filter((campaign) =>
    Array.isArray(campaign.campaignTypes) && campaign.campaignTypes.includes('Email')
  )

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Campaign List</h1>
          <p className="text-sm text-gray-500 mt-1">
            Campaigns created in Marketing Campaigns with Email selected appear here automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/marketing/campaigns/create"
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + Create Campaign
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Email Campaigns</h2>
        </div>

        {emailCampaigns.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-gray-500">No email campaigns found.</p>
            <p className="text-xs text-gray-400 mt-1">Select Email in campaign types while creating a campaign.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Campaign</th>
                  <th className="px-4 py-3 text-left font-medium">Objective</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Media Types</th>
                  <th className="px-4 py-3 text-left font-medium">Updated</th>
                  <th className="px-4 py-3 text-left font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {emailCampaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-4 py-3 font-medium text-gray-800">{campaign.name || 'Untitled Campaign'}</td>
                    <td className="px-4 py-3 text-gray-600">{campaign.objective}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{(campaign.campaignTypes || []).join(', ')}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDate(campaign.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/marketing/email/${campaign.id}`}
                        className="text-primary-600 hover:underline text-xs font-medium"
                      >
                        View
                      </Link>
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
