import { useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  CAMPAIGN_OBJECTIVE_OPTIONS,
  CAMPAIGN_STATUS_OPTIONS,
  CAMPAIGN_TYPE_GROUPS,
  getCampaignById,
  updateCampaign,
} from '../utils/marketingCampaignStore'
import {
  D3BarChart,
  D3DonutChart,
  D3LineChart,
  D3StackedBarChart,
} from '../components/reports/D3Charts'

const TABS = [
  { id: 'tools-lists', label: 'Tools Lists' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'settings', label: 'Settings' },
]

function percent(numerator, denominator) {
  if (!denominator) return 0
  return (numerator / denominator) * 100
}

function formatCurrency(value) {
  return `Rs ${Number(value || 0).toLocaleString()}`
}

function formatDate(value) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return `${parsed.toLocaleDateString()} ${parsed.toLocaleTimeString()}`
}

function updateQuestionAnswer(questions, id, answer) {
  return questions.map((question) =>
    question.id === id ? { ...question, answer } : question
  )
}

function ToolsListsTab({ campaign, totals }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Impressions</p><p className="text-2xl font-bold text-gray-900 mt-1">{totals.impressions.toLocaleString()}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Clicks</p><p className="text-2xl font-bold text-gray-900 mt-1">{totals.clicks.toLocaleString()}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Leads</p><p className="text-2xl font-bold text-gray-900 mt-1">{totals.leads.toLocaleString()}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Conversions</p><p className="text-2xl font-bold text-gray-900 mt-1">{totals.conversions.toLocaleString()}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Spend</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totals.spend)}</p></div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-700">Selected Media Campaign List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Media</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Impressions</th>
                <th className="px-4 py-3 text-left font-medium">Clicks</th>
                <th className="px-4 py-3 text-left font-medium">Leads</th>
                <th className="px-4 py-3 text-left font-medium">Conversions</th>
                <th className="px-4 py-3 text-left font-medium">Spend</th>
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
                  <td className="px-4 py-3 text-gray-600">{formatCurrency(item.spend)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/marketing/lead-generation/lists" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary-300 transition">
          <p className="text-sm font-semibold text-gray-800">Lead Lists</p>
          <p className="text-xs text-gray-500 mt-1">View and organize imported/scraped leads.</p>
        </Link>
        <Link to="/marketing/lead-generation/google-maps" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary-300 transition">
          <p className="text-sm font-semibold text-gray-800">Google Maps Leads</p>
          <p className="text-xs text-gray-500 mt-1">Capture phone, email and address from maps data.</p>
        </Link>
        <Link to="/marketing/lead-generation/import" className="bg-white border border-gray-200 rounded-xl p-4 hover:border-primary-300 transition">
          <p className="text-sm font-semibold text-gray-800">Import Leads</p>
          <p className="text-xs text-gray-500 mt-1">Bulk import leads into lists via CSV.</p>
        </Link>
      </div>
    </div>
  )
}

function AnalyticsTab({ campaign, totals }) {
  const ctr = percent(totals.clicks, totals.impressions)
  const leadRate = percent(totals.leads, totals.clicks)
  const conversionRate = percent(totals.conversions, totals.leads)
  const cpl = totals.leads ? totals.spend / totals.leads : 0
  const cpa = totals.conversions ? totals.spend / totals.conversions : 0

  const leadsByMedia = campaign.mediaPerformance.map((item) => ({
    media: item.type,
    leads: item.leads,
  }))

  const spendByMedia = campaign.mediaPerformance.map((item) => ({
    media: item.type,
    spend: item.spend,
  }))

  const conversionMix = campaign.mediaPerformance.map((item) => ({
    media: item.type,
    converted: item.conversions,
    notConverted: Math.max(0, item.leads - item.conversions),
  }))

  const funnelStages = [
    { stage: 'Impressions', count: totals.impressions },
    { stage: 'Clicks', count: totals.clicks },
    { stage: 'Leads', count: totals.leads },
    { stage: 'Conversions', count: totals.conversions },
  ]

  const weekLabels = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6']
  const weeklyLeads = weekLabels.map((week, idx) => ({
    week,
    leads: Math.max(1, Math.round((totals.leads / weekLabels.length) * (0.75 + idx * 0.08))),
  }))

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">CTR</p><p className="text-2xl font-bold text-gray-900 mt-1">{ctr.toFixed(2)}%</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Lead Rate</p><p className="text-2xl font-bold text-gray-900 mt-1">{leadRate.toFixed(2)}%</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">Conversion Rate</p><p className="text-2xl font-bold text-gray-900 mt-1">{conversionRate.toFixed(2)}%</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">CPL</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(cpl)}</p></div>
        <div className="bg-white border border-gray-200 rounded-xl p-4"><p className="text-xs text-gray-500">CPA</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(cpa)}</p></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <D3BarChart
            title="Leads By Media"
            subtitle="Lead volume by selected campaign media"
            data={leadsByMedia}
            xKey="media"
            yKey="leads"
            color="#2563eb"
          />
        </div>
        <D3DonutChart
          title="Spend Share"
          subtitle="How budget is distributed across media"
          data={spendByMedia.map((item) => ({ label: item.media, value: item.spend }))}
          labelKey="label"
          valueKey="value"
          colors={['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#14b8a6', '#f97316']}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <D3StackedBarChart
          title="Lead Quality Mix"
          subtitle="Converted versus not converted leads by media"
          data={conversionMix}
          xKey="media"
          keys={['converted', 'notConverted']}
          colors={['#16a34a', '#e5e7eb']}
        />
        <D3LineChart
          title="Weekly Lead Trend"
          subtitle="Campaign lead pace over recent weeks"
          data={weeklyLeads}
          xKey="week"
          yKey="leads"
          color="#7c3aed"
        />
      </div>

      <D3BarChart
        title="Campaign Funnel"
        subtitle="Overall funnel progression from impression to conversion"
        data={funnelStages}
        xKey="stage"
        yKey="count"
        color="#f97316"
      />
    </div>
  )
}

function SettingsTab({ id, campaign }) {
  const [name, setName] = useState(campaign?.name ?? '')
  const [campaignTypes, setCampaignTypes] = useState(campaign?.campaignTypes ?? [CAMPAIGN_TYPE_GROUPS[0].options[0]])
  const [objective, setObjective] = useState(campaign?.objective ?? CAMPAIGN_OBJECTIVE_OPTIONS[0])
  const [status, setStatus] = useState(campaign?.status ?? CAMPAIGN_STATUS_OPTIONS[0])
  const [budget, setBudget] = useState(campaign?.budget ?? '')
  const [startDate, setStartDate] = useState(campaign?.startDate ?? '')
  const [endDate, setEndDate] = useState(campaign?.endDate ?? '')
  const [campaignQA, setCampaignQA] = useState(campaign?.campaignQA ?? [])
  const [savedAt, setSavedAt] = useState(campaign?.updatedAt ?? null)
  const [notice, setNotice] = useState('')

  function toggleCampaignType(type) {
    setCampaignTypes((prev) => {
      if (prev.includes(type)) return prev.filter((value) => value !== type)
      return [...prev, type]
    })
  }

  function saveCampaignSettings() {
    const updated = updateCampaign(id, {
      name,
      campaignTypes,
      objective,
      status,
      budget,
      startDate,
      endDate,
      campaignQA,
    })

    if (!updated) {
      setNotice('Unable to save changes.')
      return
    }

    setSavedAt(updated.updatedAt)
    setNotice('Campaign settings saved.')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-5">
      {notice && <div className="rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm px-3 py-2">{notice}</div>}

      <div className="grid md:grid-cols-2 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Campaign name" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          {CAMPAIGN_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <select value={objective} onChange={(e) => setObjective(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          {CAMPAIGN_OBJECTIVE_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>

        <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Budget" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm md:col-span-2" />
        <div className="md:col-span-2 border border-gray-200 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-800 mb-2">Campaign Types</p>
          <div className="space-y-4">
            {CAMPAIGN_TYPE_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">{group.label}</p>
                <div className="grid sm:grid-cols-2 gap-2">
                  {group.options.map((type) => (
                    <label key={type} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={campaignTypes.includes(type)}
                        onChange={() => toggleCampaignType(type)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-800 mb-2">Campaign Questions & Answers</h2>
        <div className="space-y-3">
          {campaignQA.map((item) => (
            <label key={item.id} className="block">
              <p className="text-sm text-gray-700 mb-1">{item.question}</p>
              <textarea
                value={item.answer}
                onChange={(e) => setCampaignQA((prev) => updateQuestionAnswer(prev, item.id, e.target.value))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[70px]"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-gray-400">Last saved: {formatDate(savedAt)}</p>
        <button type="button" onClick={saveCampaignSettings} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Save Changes
        </button>
      </div>
    </div>
  )
}

export default function CampaignWorkspacePage({ forcedTab }) {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const preferredTab = TABS.some((tab) => tab.id === forcedTab) ? forcedTab : requestedTab
  const activeTab = TABS.some((tab) => tab.id === preferredTab) ? preferredTab : 'tools-lists'
  const campaign = useMemo(() => getCampaignById(id), [id])

  if (!campaign) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-gray-900">Campaign not found</h1>
          <p className="text-sm text-gray-500 mt-2">This campaign may have been deleted or never created.</p>
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
          <h1 className="text-2xl font-bold text-gray-900">{campaign.name || 'Campaign Workspace'}</h1>
          <p className="text-sm text-gray-500 mt-1">Manage tools lists, analytics, and settings for this campaign.</p>
        </div>
        <Link to="/marketing/campaigns" className="text-sm text-primary-600 hover:underline">
          Back to Campaigns
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-2 inline-flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setSearchParams({ tab: tab.id })}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'tools-lists' && <ToolsListsTab campaign={campaign} totals={totals} />}
      {activeTab === 'analytics' && <AnalyticsTab campaign={campaign} totals={totals} />}
      {activeTab === 'settings' && <SettingsTab id={id} campaign={campaign} />}
    </div>
  )
}
