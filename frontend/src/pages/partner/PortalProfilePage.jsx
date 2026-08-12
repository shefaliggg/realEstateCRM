import { useEffect, useState } from 'react'
import { getMe, updateMe } from '../../api/partnerApi'

const inputClass = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300'
const readOnlyClass = 'w-full border border-gray-100 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500'

export default function PortalProfilePage() {
  const [partner, setPartner] = useState(null)
  const [notLinked, setNotLinked] = useState(false)
  const [form, setForm] = useState({ contactPerson: '', phone: '', city: '' })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getMe()
      .then((p) => {
        setPartner(p)
        setForm({ contactPerson: p.contactPerson, phone: p.phone, city: p.city || '' })
      })
      .catch(() => setNotLinked(true))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      const updated = await updateMe(form)
      setPartner(updated)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  if (notLinked) {
    return (
      <div className="p-6 max-w-xl mx-auto">
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-gray-600 font-medium">No partner company linked</p>
          <p className="text-sm text-gray-400 mt-1">Admin accounts aren't linked to a channel partner company, so there's no profile to show here.</p>
        </div>
      </div>
    )
  }

  if (!partner) return <div className="p-6 text-gray-400">Loading...</div>

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your company and contact details.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Company Name</label>
          <input className={readOnlyClass} value={partner.name} disabled />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input className={readOnlyClass} value={partner.email} disabled />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Commission Rate</label>
          <input className={readOnlyClass} value={`${partner.commissionRate}%`} disabled />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Contact Person</label>
          <input className={inputClass} value={form.contactPerson} onChange={(e) => setForm((f) => ({ ...f, contactPerson: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
          <input className={inputClass} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
          <input className={inputClass} value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
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
