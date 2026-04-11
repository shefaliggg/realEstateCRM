import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const PROPERTIES = [
  { id: 1, name: 'Skyline Residency - 2BHK' },
  { id: 2, name: 'Green Valley Villa - 3BHK' },
  { id: 3, name: 'Corporate Park' },
  { id: 4, name: 'Urban Homes - Penthouse' },
  { id: 5, name: 'Metro Heights - Plot' },
]

const LEADS = [
  { id: 1, name: 'Ankit Joshi' },
  { id: 2, name: 'Seema Patel' },
  { id: 3, name: 'Rohit Das' },
  { id: 4, name: 'Neha Reddy' },
  { id: 5, name: 'Vikram Kapoor' },
]

const STAGES = ['Lead Qualification', 'Needs Analysis', 'Proposal Sent', 'Negotiation', 'Contract Review', 'Won', 'Lost']

export default function AddDealPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    dealName: '',
    property: '',
    lead: '',
    stage: 'Lead Qualification',
    dealValue: '',
    commission: '',
    closingDate: '',
    description: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.dealName.trim()) e.dealName = 'Required'
    if (!form.property) e.property = 'Required'
    if (!form.lead) e.lead = 'Required'
    if (!form.dealValue) e.dealValue = 'Required'
    if (!form.closingDate) e.closingDate = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    navigate('/deals')
  }

  const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder:text-gray-300'
  const selectCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-700'

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/deals"
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <nav className="text-xs text-gray-400 mb-0.5">
            <Link to="/deals" className="hover:text-primary-600">
              Deals
            </Link>
            <span className="mx-1">/</span>
            <span className="text-gray-700">Add Deal</span>
          </nav>
          <h2 className="text-xl font-bold text-gray-900">Add New Deal</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Deal Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center text-xs">📋</span>
            Deal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Deal Name <span className="text-red-500">*</span>
              </label>
              <input
                value={form.dealName}
                onChange={(e) => set('dealName', e.target.value)}
                placeholder="e.g., Skyline Residency - 2BHK Sale"
                className={`${inputCls} ${errors.dealName ? 'border-red-400 focus:ring-red-400' : ''}`}
              />
              {errors.dealName && <p className="text-xs text-red-500 mt-1">{errors.dealName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Stage <span className="text-red-500">*</span>
              </label>
              <select
                value={form.stage}
                onChange={(e) => set('stage', e.target.value)}
                className={selectCls}
              >
                {STAGES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Property <span className="text-red-500">*</span>
              </label>
              <select
                value={form.property}
                onChange={(e) => set('property', e.target.value)}
                className={`${selectCls} ${errors.property ? 'border-red-400' : ''}`}
              >
                <option value="">Select property</option>
                {PROPERTIES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              {errors.property && <p className="text-xs text-red-500 mt-1">{errors.property}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Lead <span className="text-red-500">*</span>
              </label>
              <select
                value={form.lead}
                onChange={(e) => set('lead', e.target.value)}
                className={`${selectCls} ${errors.lead ? 'border-red-400' : ''}`}
              >
                <option value="">Select lead</option>
                {LEADS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {errors.lead && <p className="text-xs text-red-500 mt-1">{errors.lead}</p>}
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center text-xs">💰</span>
            Financial Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Deal Value (INR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.dealValue}
                onChange={(e) => set('dealValue', e.target.value)}
                placeholder="0"
                className={`${inputCls} ${errors.dealValue ? 'border-red-400' : ''}`}
              />
              {errors.dealValue && <p className="text-xs text-red-500 mt-1">{errors.dealValue}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Commission (INR)</label>
              <input
                type="number"
                value={form.commission}
                onChange={(e) => set('commission', e.target.value)}
                placeholder="Auto-calculated"
                disabled
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-400 mt-1">Auto-calculated</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Est. Closing Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={form.closingDate}
                onChange={(e) => set('closingDate', e.target.value)}
                className={`${inputCls} ${errors.closingDate ? 'border-red-400' : ''}`}
              />
              {errors.closingDate && <p className="text-xs text-red-500 mt-1">{errors.closingDate}</p>}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center text-xs">📝</span>
            Notes
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Deal summary and key points…"
                rows={3}
                className={inputCls}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Internal Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                placeholder="Any special conditions or notes…"
                rows={3}
                className={inputCls}
              />
            </div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-gray-50 py-4 border-t border-gray-200 -mx-6 px-6">
          <Link to="/deals" className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition">
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
            {saving ? 'Saving…' : 'Add Deal'}
          </button>
        </div>
      </form>
    </div>
  )
}
