import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const SOURCES = ['Walk-in', 'Website', 'Referral', 'Portal - 99acres', 'Portal - MagicBricks', 'Portal - Housing', 'Google Ads', 'Facebook', 'Instagram', 'Cold Call', 'Event', 'Other']
const NURTURE_STAGES = ['Cold', 'Warm', 'Interested', 'Very Interested', 'Nurtured']

const cls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300'

export default function AddLeadPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    source: 'Walk-in',
    nurtureStage: 'Cold',
    leadScore: 3,
    budget: '',
    requirements: '',
    city: '',
    nextFollowUpDate: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.phone) {
      setError('Name and phone are required')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        budget: form.budget ? Number(form.budget) : undefined,
        leadScore: Number(form.leadScore),
      }
      const res = await api.post('/leads', payload)
      navigate(`/leads/${res.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lead')
    } finally {
      setLoading(false)
    }
  }

  return (
          <div className="p-6 max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/leads" className="hover:text-primary-600">Leads</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Add Lead</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">👤 Add New Lead</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">👤 Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} required
                  className={cls} placeholder="Amit Sharma" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)} required
                  className={cls} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  className={cls} placeholder="amit@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input value={form.city} onChange={e => set('city', e.target.value)}
                  className={cls} placeholder="Hyderabad" />
              </div>
            </div>
          </div>

          {/* Lead Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">📊 Lead Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select value={form.source} onChange={e => set('source', e.target.value)} className={cls}>
                  {SOURCES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nurture Stage</label>
                <select value={form.nurtureStage} onChange={e => set('nurtureStage', e.target.value)} className={cls}>
                  {NURTURE_STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Score: <span className="text-primary-600 font-bold">{form.leadScore} ★</span>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => set('leadScore', i)}
                      className={`text-xl transition-transform hover:scale-110 ${i <= form.leadScore ? 'text-yellow-400' : 'text-gray-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget (₹)</label>
                <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)}
                  className={cls} placeholder="7500000" min="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Follow-up Date</label>
                <input type="date" value={form.nextFollowUpDate} onChange={e => set('nextFollowUpDate', e.target.value)}
                  className={cls} />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">📝 Requirements</h2>
            <textarea value={form.requirements} onChange={e => set('requirements', e.target.value)}
              rows={3} className={cls}
              placeholder="2 BHK, Gachibowli area, ready to move..." />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
              {loading ? 'Creating...' : 'Add Lead'}
            </button>
            <Link to="/leads" className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
      )
}
