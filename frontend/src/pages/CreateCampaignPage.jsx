import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CAMPAIGN_TYPE_GROUPS,
  CAMPAIGN_OBJECTIVE_OPTIONS,
  createCampaign,
} from '../utils/marketingCampaignStore'

function updateQuestionAnswer(questions, id, answer) {
  return questions.map((question) =>
    question.id === id ? { ...question, answer } : question
  )
}

export default function CreateCampaignPage() {
  const navigate = useNavigate()

  const [campaignName, setCampaignName] = useState('')
  const [campaignTypes, setCampaignTypes] = useState([CAMPAIGN_TYPE_GROUPS[0].options[0]])
  const [objective, setObjective] = useState(CAMPAIGN_OBJECTIVE_OPTIONS[0])
  const [budget, setBudget] = useState('')
  const [campaignQA, setCampaignQA] = useState([
    {
      id: 'campaign-q-1',
      question: 'What is the single most important outcome for this campaign?',
      answer: '',
    },
    {
      id: 'campaign-q-2',
      question: 'Which audience persona tags should this campaign target first?',
      answer: '',
    },
    {
      id: 'campaign-q-3',
      question: 'What offer or message should persuade this audience to respond?',
      answer: '',
    },
    {
      id: 'campaign-q-4',
      question: 'How will you measure success for this campaign?',
      answer: '',
    },
    {
      id: 'campaign-q-5',
      question: 'What action should the customer take after seeing this campaign?',
      answer: '',
    },
  ])

  const [error, setError] = useState('')

  function toggleCampaignType(type) {
    setCampaignTypes((prev) => {
      if (prev.includes(type)) return prev.filter((value) => value !== type)
      return [...prev, type]
    })
  }

  function saveCampaignAndOpenSettings() {
    if (!campaignName.trim()) {
      setError('Please add campaign name.')
      return
    }

    if (campaignTypes.length === 0) {
      setError('Please select at least one campaign type.')
      return
    }

      const createdCampaign = createCampaign({
        name: campaignName,
        campaignTypes,
        objective,
        budget,
        campaignQA,
        status: 'Draft',
      })

    setError('')
      navigate(`/marketing/campaigns/${createdCampaign.id}/settings`)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create AI Marketing Campaign</h1>
          <p className="text-sm text-gray-500 mt-1">
            Define only the campaign goal discovery here. Company and customer discovery lives in Marketing Settings.
          </p>
        </div>
        <Link to="/marketing/campaigns" className="text-sm text-primary-600 hover:underline">
          Back to Campaigns
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="mb-5 rounded-xl border border-sky-100 bg-sky-50 px-4 py-3">
          <p className="text-sm text-sky-900 font-medium">Campaign Goal Discovery</p>
          <p className="text-xs text-sky-700 mt-1">
            Need to update company details or customer personas first? Go to <Link to="/marketing/settings/company-knowledge" className="underline font-medium">Settings / Company Knowledge</Link>.
          </p>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}

        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-3">
            <input value={campaignName} onChange={(e) => setCampaignName(e.target.value)} placeholder="Campaign name" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Campaign budget (optional)" className="border border-gray-200 rounded-lg px-3 py-2 text-sm" />
            <select value={objective} onChange={(e) => setObjective(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
              {CAMPAIGN_OBJECTIVE_OPTIONS.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
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
            <h2 className="text-sm font-semibold text-gray-800 mb-2">Campaign Goal Discovery</h2>
            <div className="space-y-3">
              {campaignQA.map((item) => (
                <label key={item.id} className="block">
                  <p className="text-sm text-gray-700 mb-1">{item.question}</p>
                  <textarea
                    value={item.answer}
                    onChange={(e) => setCampaignQA((prev) => updateQuestionAnswer(prev, item.id, e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[70px]"
                    placeholder="Your answer"
                  />
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              These answers are saved under campaign settings and stay editable.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={saveCampaignAndOpenSettings} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Save Campaign
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
