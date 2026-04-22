import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  CAMPAIGN_TYPE_GROUPS,
  CAMPAIGN_OBJECTIVE_OPTIONS,
  CAMPAIGN_STATUS_OPTIONS,
  getCampaignById,
  updateCampaign,
} from '../utils/marketingCampaignStore'

function updateQuestionAnswer(questions, id, answer) {
  return questions.map((question) =>
    question.id === id ? { ...question, answer } : question
  )
}

function formatDate(value) {
  if (!value) return '-'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '-'
  return `${parsed.toLocaleDateString()} ${parsed.toLocaleTimeString()}`
}

export default function CampaignSettingsPage() {
  const { id } = useParams()
  const campaign = useMemo(() => getCampaignById(id), [id])

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

  function saveCampaignSettings() {
    const updated = updateCampaign(campaign.id, {
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
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaign Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Edit campaign details and AI goal discovery answers.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/marketing/campaigns/${id}`} className="text-sm text-primary-600 hover:underline">
            View Campaign
          </Link>
          <Link to={`/marketing/campaigns/${id}/analytics`} className="text-sm text-primary-600 hover:underline">
            Campaign Analytics
          </Link>
          <Link to="/marketing/campaigns" className="text-sm text-primary-600 hover:underline">
            Back to Campaigns
          </Link>
        </div>
      </div>

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
    </div>
  )
}
