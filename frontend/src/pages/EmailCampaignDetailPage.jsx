import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { D3BarChart, D3DonutChart, D3LineChart } from '../components/reports/D3Charts'
import { getCampaignById } from '../utils/marketingCampaignStore'

const TABS = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'leads', label: 'List of Leads' },
  { id: 'template', label: 'Template Design' },
]

function formatDate(value) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return `${parsed.toLocaleDateString()} ${parsed.toLocaleTimeString()}`
}

function percent(numerator, denominator) {
  if (!denominator) return 0
  return (numerator / denominator) * 100
}

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString()}`
}

function getTemplateName(campaign) {
  if (campaign?.emailTemplateName?.trim()) return campaign.emailTemplateName

  const objectiveMap = {
    'Lead Generation': 'Lead Nurture - Intro Template',
    'Site Visit Bookings': 'Site Visit Invite Template',
    'Brand Awareness': 'Brand Story Template',
    'Re-engagement': 'Reactivation Template',
    'Event Registrations': 'Event Invite Template',
    'Closed Deal Acceleration': 'Offer Closing Template',
  }
  return objectiveMap[campaign?.objective] || 'Default Email Template'
}

export default function EmailCampaignDetailPage() {
  const { id } = useParams()
  const campaign = useMemo(() => getCampaignById(id), [id])
  const [activeTab, setActiveTab] = useState('analytics')

  if (!campaign) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-gray-900">Email campaign not found</h1>
          <p className="text-sm text-gray-500 mt-2">This campaign may have been deleted or never created.</p>
          <Link to="/marketing/email" className="inline-block mt-4 text-sm text-primary-600 hover:underline">
            Back to Email Campaigns
          </Link>
        </div>
      </div>
    )
  }

  if (!campaign.campaignTypes?.includes('Email')) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-gray-900">Not an email campaign</h1>
          <p className="text-sm text-gray-500 mt-2">This campaign does not include Email in its selected campaign types.</p>
          <Link to="/marketing/email" className="inline-block mt-4 text-sm text-primary-600 hover:underline">
            Back to Email Campaigns
          </Link>
        </div>
      </div>
    )
  }

  const emailMedia = campaign.mediaPerformance?.find((item) => item.type === 'Email') || {
    type: 'Email',
    status: campaign.status || 'Draft',
    impressions: 0,
    clicks: 0,
    leads: 0,
    conversions: 0,
    spend: 0,
  }

  const openRate = percent(emailMedia.clicks, emailMedia.impressions)
  const clickToLeadRate = percent(emailMedia.leads, emailMedia.clicks)
  const conversionRate = percent(emailMedia.conversions, emailMedia.leads)
  const cpl = emailMedia.leads ? emailMedia.spend / emailMedia.leads : 0

  const funnelData = [
    { stage: 'Sent', value: emailMedia.impressions },
    { stage: 'Opened', value: emailMedia.clicks },
    { stage: 'Leads', value: emailMedia.leads },
    { stage: 'Conversions', value: emailMedia.conversions },
  ]

  const performanceMix = [
    { label: 'Opened', value: emailMedia.clicks },
    { label: 'Not Opened', value: Math.max(0, emailMedia.impressions - emailMedia.clicks) },
  ]

  const weeklyTrend = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map((week, idx) => ({
    week,
    leads: Math.max(0, Math.round((emailMedia.leads / 6) * (0.7 + idx * 0.1))),
  }))

  const leadRows = useMemo(() => {
    const total = Math.max(6, Math.min(24, emailMedia.impressions || 0))
    const openedCount = Math.min(total, Math.round(total * (openRate / 100)))
    const rows = []
    for (let i = 1; i <= total; i += 1) {
      const opened = i <= openedCount
      rows.push({
        id: `email-lead-${i}`,
        name: `Contact ${i}`,
        email: `contact${i}@example.com`,
        status: opened ? 'Opened' : 'Not Opened',
      })
    }
    return rows
  }, [emailMedia.impressions, openRate])

  const [templateSubject, setTemplateSubject] = useState(`${campaign.name || 'Campaign'} | Update`)
  const [templatePreheader, setTemplatePreheader] = useState('Quick update from our team.')
  const [templateBody, setTemplateBody] = useState(
    `Hi {{name}},\n\nThank you for your interest. Here is the latest update for this campaign.\n\nRegards,\n${campaign.name || 'Marketing Team'}`
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{campaign.name || 'Email Campaign'}</h1>
          <p className="text-sm text-gray-500 mt-1">Email campaign details, template used, and performance analytics.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-2 inline-flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'analytics' && (
        <>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Emails Sent</p><p className="text-2xl font-bold text-gray-900 mt-1">{emailMedia.impressions.toLocaleString()}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Opened</p><p className="text-2xl font-bold text-gray-900 mt-1">{emailMedia.clicks.toLocaleString()}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Leads</p><p className="text-2xl font-bold text-gray-900 mt-1">{emailMedia.leads.toLocaleString()}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Conversions</p><p className="text-2xl font-bold text-gray-900 mt-1">{emailMedia.conversions.toLocaleString()}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Spend</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(emailMedia.spend)}</p></div>
      </div>

      <div className="grid xl:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">Campaign Details</h2>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div><p className="text-xs text-gray-500">Objective</p><p className="text-gray-800">{campaign.objective}</p></div>
            <div><p className="text-xs text-gray-500">Status</p><p className="text-gray-800">{campaign.status}</p></div>
            <div><p className="text-xs text-gray-500">Budget</p><p className="text-gray-800">{campaign.budget || '-'}</p></div>
            <div><p className="text-xs text-gray-500">Last Updated</p><p className="text-gray-800">{formatDate(campaign.updatedAt)}</p></div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-800">Template Used</h2>
          <p className="text-lg font-semibold text-gray-900">{getTemplateName(campaign)}</p>
          <p className="text-sm text-gray-500">Configured based on campaign objective and email channel selection.</p>
          <div className="pt-2 flex gap-2">
            <Link to="/marketing/email/templates" className="text-sm text-primary-600 hover:underline">View Templates</Link>
            <Link to="/marketing/email/settings" className="text-sm text-primary-600 hover:underline">Email Settings</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Open Rate</p><p className="text-2xl font-bold text-gray-900 mt-1">{openRate.toFixed(2)}%</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Click-to-Lead Rate</p><p className="text-2xl font-bold text-gray-900 mt-1">{clickToLeadRate.toFixed(2)}%</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Lead Conversion Rate</p><p className="text-2xl font-bold text-gray-900 mt-1">{conversionRate.toFixed(2)}%</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">CPL</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(cpl)}</p></div>
      </div>

      <div className="grid xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <D3BarChart
            title="Email Funnel"
            subtitle="Sent to conversion progression"
            data={funnelData}
            xKey="stage"
            yKey="value"
            color="#2563eb"
          />
        </div>
        <D3DonutChart
          title="Open Mix"
          subtitle="Opened vs not opened emails"
          data={performanceMix}
          labelKey="label"
          valueKey="value"
          colors={['#16a34a', '#e5e7eb']}
        />
      </div>

      <D3LineChart
        title="Weekly Email Lead Trend"
        subtitle="Lead movement over recent 6 weeks"
        data={weeklyTrend}
        xKey="week"
        yKey="leads"
        color="#7c3aed"
      />
        </>
      )}

      {activeTab === 'leads' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Lead Delivery Status</h2>
            <div className="text-xs text-gray-500">Opened: {leadRows.filter((row) => row.status === 'Opened').length} | Not Opened: {leadRows.filter((row) => row.status === 'Not Opened').length}</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Lead Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leadRows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 text-gray-800 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-gray-600">{row.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${row.status === 'Opened' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'template' && (
        <div className="grid xl:grid-cols-2 gap-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-gray-800">Template Design</h2>
            <input
              value={templateSubject}
              onChange={(e) => setTemplateSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <input
              value={templatePreheader}
              onChange={(e) => setTemplatePreheader(e.target.value)}
              placeholder="Preheader text"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            <textarea
              value={templateBody}
              onChange={(e) => setTemplateBody(e.target.value)}
              placeholder="Template body"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[230px]"
            />
            <p className="text-xs text-gray-400">Use placeholders like {'{{name}}'} in the body.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Template Preview</h2>
            <div className="rounded-lg border border-gray-200 p-4 bg-gray-50 space-y-3">
              <div>
                <p className="text-xs text-gray-500">Subject</p>
                <p className="text-sm font-semibold text-gray-900">{templateSubject || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Preheader</p>
                <p className="text-sm text-gray-700">{templatePreheader || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Body</p>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{templateBody || '-'}</pre>
              </div>
            </div>
            <div className="pt-3 flex gap-2">
              <Link to="/marketing/email/templates" className="text-sm text-primary-600 hover:underline">Manage Templates</Link>
              <Link to="/marketing/email/settings" className="text-sm text-primary-600 hover:underline">Email Settings</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
