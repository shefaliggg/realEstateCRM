import { useEffect, useState } from 'react'
import { getMyBuilder, updateMyBuilder } from '../api/builderApi'

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300'
const readOnlyClass = 'w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500'

export default function CompanyProfilePage() {
  const [builder, setBuilder] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', contactEmail: '', contactPhone: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getMyBuilder()
      .then((b) => {
        setBuilder(b)
        setForm({ name: b.name, contactEmail: b.contactEmail || '', contactPhone: b.contactPhone || '' })
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load company profile'))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const updated = await updateMyBuilder(form)
      setBuilder(updated)
      setSaved(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save company profile')
    } finally {
      setSaving(false)
    }
  }

  if (error && !builder) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-gray-600 font-medium">{error}</p>
        </div>
      </div>
    )
  }

  if (!builder) return <div className="p-6 text-gray-400">Loading...</div>

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Company Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your company's details on PropVault.</p>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
          <input className={inputClass} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Contact Email</label>
          <input className={inputClass} type="email" value={form.contactEmail} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Contact Phone</label>
          <input className={inputClass} value={form.contactPhone} onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Plan</label>
          <input className={readOnlyClass} value={builder.billingPlan} disabled />
          <p className="text-[11px] text-gray-400 mt-1">Managed by PropVault — contact support to change your plan.</p>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={saving} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && <span className="text-sm text-green-600">Saved</span>}
        </div>
      </form>
    </div>
  )
}
