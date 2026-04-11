import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const SOURCES = ['Website', 'Phone Call', 'Referral', '99acres', 'MagicBricks', 'Facebook', 'Google Ads', 'Instagram', 'LinkedIn', 'Walk-in', 'Direct']

export default function AddLeadPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Website',
    stage: 'New',
    budget: '',
    requirements: '',
    city: '',
    interestedIn: '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.phone.trim()) e.phone = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    if (!form.budget) e.budget = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    navigate('/leads')
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder:text-gray-300'
  const selectCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-700'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/leads"
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <nav className="text-xs text-gray-400 mb-0.5">
            <Link to="/leads" className="hover:text-primary-600">Leads</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-700">Add Lead</span>
          </nav>
          <h2 className="text-xl font-bold text-gray-900">Add New Lead</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Personal Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center text-xs">👤</span>
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. John Doe"
                className={`${inputCls} ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="john@example.com"
                className={`${inputCls} ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className={`${inputCls} ${errors.phone ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">City</label>
              <input
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                placeholder="e.g. Mumbai"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Lead Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center text-xs">📊</span>
            Lead Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Source <span className="text-red-500">*</span></label>
              <select value={form.source} onChange={(e) => set('source', e.target.value)} className={selectCls}>
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stage</label>
              <select value={form.stage} onChange={(e) => set('stage', e.target.value)} className={selectCls}>
                <option>New</option>
                <option>Contacted</option>
                <option>Site Visit Scheduled</option>
                <option>Negotiation</option>
                <option>Hot Lead</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Budget (INR) <span className="text-red-500">*</span></label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => set('budget', e.target.value)}
                  placeholder="0"
                  className={`${inputCls} pl-7 ${errors.budget ? 'border-red-400' : ''}`}
                />
              </div>
              {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Interested In</label>
              <input
                value={form.interestedIn}
                onChange={(e) => set('interestedIn', e.target.value)}
                placeholder="e.g. 2BHK, Commercial"
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center text-xs">📝</span>
            Requirements
          </h3>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Details</label>
            <textarea
              value={form.requirements}
              onChange={(e) => set('requirements', e.target.value)}
              placeholder="Property requirements, preferences, timeline…"
              rows={4}
              className={inputCls}
            />
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-gray-50 py-4 border-t border-gray-200 -mx-6 px-6">
          <Link to="/leads" className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {saving ? 'Saving…' : 'Add Lead'}
          </button>
        </div>
      </form>
    </div>
  )
}
