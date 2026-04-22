import { useMemo, useState } from 'react'
import {
  getMarketingProfileSettings,
  saveMarketingProfileSettings,
} from '../utils/marketingCampaignStore'

function updateQuestionAnswer(questions, id, answer) {
  return questions.map((question) =>
    question.id === id ? { ...question, answer } : question
  )
}

export default function MarketingSettingsPage() {
  const defaults = useMemo(() => getMarketingProfileSettings(), [])

  const [savedData, setSavedData] = useState(defaults)
  const [companyDetails, setCompanyDetails] = useState(defaults.companyDetails)
  const [personaTags, setPersonaTags] = useState(defaults.personaTags)
  const [personaInput, setPersonaInput] = useState('')
  const [discoveryQA, setDiscoveryQA] = useState(defaults.discoveryQA)
  const [notice, setNotice] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const currentDraft = {
    companyDetails,
    personaTags,
    discoveryQA,
  }
  const isDirty = JSON.stringify(currentDraft) !== JSON.stringify({
    companyDetails: savedData.companyDetails,
    personaTags: savedData.personaTags,
    discoveryQA: savedData.discoveryQA,
  })

  function addPersonaTag() {
    if (!isEditing) return
    const value = personaInput.trim()
    if (!value) return
    if (personaTags.some((tag) => tag.toLowerCase() === value.toLowerCase())) {
      setPersonaInput('')
      return
    }
    setPersonaTags((prev) => [...prev, value])
    setPersonaInput('')
  }

  function removePersonaTag(tagToRemove) {
    if (!isEditing) return
    setPersonaTags((prev) => prev.filter((tag) => tag !== tagToRemove))
  }

  function startEditing() {
    setNotice('')
    setIsEditing(true)
  }

  function cancelEditing() {
    setCompanyDetails(savedData.companyDetails)
    setPersonaTags(savedData.personaTags)
    setDiscoveryQA(savedData.discoveryQA)
    setPersonaInput('')
    setIsEditing(false)
    setNotice('Changes discarded.')
  }

  function saveSettings() {
    const saved = saveMarketingProfileSettings({
      companyDetails,
      personaTags,
      discoveryQA,
    })
    setSavedData(saved)
    setIsEditing(false)
    setNotice('Company Knowledge saved.')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Knowledge</h1>
        <p className="text-sm text-gray-500 mt-1">
          Store reusable company details and customer discovery inputs for AI campaigns.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-6">
        {notice && (
          <div className="rounded-lg border border-green-200 bg-green-50 text-green-700 text-sm px-3 py-2">
            {notice}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs">
            {isEditing ? (
              <span className={isDirty ? 'text-amber-700' : 'text-emerald-700'}>
                {isDirty ? 'Unsaved changes' : 'No unsaved changes'}
              </span>
            ) : (
              <span className="text-gray-500">Form is in view mode.</span>
            )}
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button type="button" onClick={startEditing} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
                Edit
              </button>
            ) : (
              <>
                <button type="button" onClick={cancelEditing} className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveSettings}
                  disabled={!isDirty}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Save
                </button>
              </>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Company Details</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <input disabled={!isEditing} value={companyDetails.companyName} onChange={(e) => setCompanyDetails((prev) => ({ ...prev, companyName: e.target.value }))} placeholder="Company name" className="border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500" />
            <input disabled={!isEditing} value={companyDetails.industry} onChange={(e) => setCompanyDetails((prev) => ({ ...prev, industry: e.target.value }))} placeholder="Industry" className="border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500" />
            <input disabled={!isEditing} value={companyDetails.website} onChange={(e) => setCompanyDetails((prev) => ({ ...prev, website: e.target.value }))} placeholder="Website" className="border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500" />
            <input disabled={!isEditing} value={companyDetails.primaryMarket} onChange={(e) => setCompanyDetails((prev) => ({ ...prev, primaryMarket: e.target.value }))} placeholder="Primary market or geography" className="border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500" />
            <textarea disabled={!isEditing} value={companyDetails.productsOrServices} onChange={(e) => setCompanyDetails((prev) => ({ ...prev, productsOrServices: e.target.value }))} placeholder="Products or services" className="md:col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[70px] disabled:bg-gray-50 disabled:text-gray-500" />
            <textarea disabled={!isEditing} value={companyDetails.uniqueValueProposition} onChange={(e) => setCompanyDetails((prev) => ({ ...prev, uniqueValueProposition: e.target.value }))} placeholder="Unique value proposition" className="md:col-span-2 border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[70px] disabled:bg-gray-50 disabled:text-gray-500" />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Customer Persona Tags</h2>
          <div className="flex gap-2 mb-2">
            <input
              value={personaInput}
              onChange={(e) => setPersonaInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addPersonaTag()
                }
              }}
              placeholder="Add tag (e.g. Investor, Premium buyer, NRI buyer)"
              disabled={!isEditing}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
            />
            <button type="button" disabled={!isEditing} onClick={addPersonaTag} className="px-3 py-2 rounded-lg bg-gray-900 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm">
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {personaTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => removePersonaTag(tag)}
                disabled={!isEditing}
                className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Click to remove"
              >
                {tag} ×
              </button>
            ))}
            {personaTags.length === 0 && <p className="text-xs text-gray-400">No persona tags added yet.</p>}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Company & Customer Discovery Q&A</h2>
          <div className="space-y-3">
            {discoveryQA.map((item) => (
              <label key={item.id} className="block">
                <p className="text-sm text-gray-700 mb-1">{item.question}</p>
                <textarea
                  disabled={!isEditing}
                  value={item.answer}
                  onChange={(e) => setDiscoveryQA((prev) => updateQuestionAnswer(prev, item.id, e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm min-h-[70px] disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Your answer"
                />
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}