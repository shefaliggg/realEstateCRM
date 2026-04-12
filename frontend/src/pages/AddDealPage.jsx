import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'

const STAGES = ['Lead Qualification', 'Needs Analysis', 'Proposal Sent', 'Negotiation', 'Contract Review', 'Won', 'Lost']
const cls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300'

export default function AddDealPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [leads, setLeads] = useState([])
  const [units, setUnits] = useState([])
  const [filteredUnits, setFilteredUnits] = useState([])
  const [form, setForm] = useState({
    dealName: '',
    projectId: '',
    unitId: '',
    leadId: '',
    stage: 'Lead Qualification',
    value: '',
    commission: '',
    closingDate: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/projects'), api.get('/leads')])
      .then(([pRes, lRes]) => {
        setProjects(pRes.data)
        setLeads(lRes.data)
      })
      .catch(() => setError('Failed to load form data'))
  }, [])

  const handleProjectChange = async projectId => {
    setForm(f => ({ ...f, projectId, unitId: '' }))
    if (!projectId) { setUnits([]); setFilteredUnits([]); return }
    try {
      const res = await api.get(`/projects/${projectId}/units`)
      const available = res.data.filter(u => u.status === 'Available')
      setUnits(available)
      setFilteredUnits(available)
    } catch {
      setUnits([])
      setFilteredUnits([])
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.dealName || !form.unitId || !form.leadId) {
      setError('Deal name, unit, and lead are required')
      return
    }
    setLoading(true)
    try {
      const payload = {
        dealName: form.dealName,
        unit: form.unitId,
        lead: form.leadId,
        stage: form.stage,
        value: form.value ? Number(form.value) : undefined,
        commission: form.commission ? Number(form.commission) : undefined,
        closingDate: form.closingDate || undefined,
        description: form.description,
      }
      const res = await api.post('/deals', payload)
      navigate(`/deals/${res.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create deal')
    } finally {
      setLoading(false)
    }
  }

  return (
          <div className="p-6 max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/deals" className="hover:text-primary-600">Deals</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Add Deal</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">🤝 Add New Deal</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Deal Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">📋 Deal Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Name *</label>
                <input value={form.dealName} onChange={e => set('dealName', e.target.value)} required
                  className={cls} placeholder="Deal for Block A-301" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                <select value={form.stage} onChange={e => set('stage', e.target.value)} className={cls}>
                  {STAGES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lead *</label>
                <select value={form.leadId} onChange={e => set('leadId', e.target.value)} className={cls} required>
                  <option value="">Select lead...</option>
                  {leads.map(l => <option key={l._id} value={l._id}>{l.name} — {l.phone}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Unit Picker */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">🏠 Unit Selection *</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select value={form.projectId} onChange={e => handleProjectChange(e.target.value)} className={cls}>
                  <option value="">Select project...</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              {form.projectId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Unit {filteredUnits.length === 0 ? '(no available units)' : `(${filteredUnits.length} available)`}
                  </label>
                  <select value={form.unitId} onChange={e => set('unitId', e.target.value)} className={cls} required>
                    <option value="">Select unit...</option>
                    {filteredUnits.map(u => (
                      <option key={u._id} value={u._id}>
                        Block {u.block} – {u.unitNo} (Floor {u.floor}) · {u.bhkType}{u.carpetArea ? ` · ${u.carpetArea} sqft` : ''}{u.basePrice ? ` · ₹${(u.basePrice / 100000).toFixed(1)}L` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Financials */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">💰 Financials</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deal Value (₹)</label>
                <input type="number" min="0" value={form.value} onChange={e => set('value', e.target.value)}
                  className={cls} placeholder="7500000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commission (₹)</label>
                <input type="number" min="0" value={form.commission} onChange={e => set('commission', e.target.value)}
                  className={cls} placeholder="150000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Close</label>
                <input type="date" value={form.closingDate} onChange={e => set('closingDate', e.target.value)}
                  className={cls} />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">📝 Description</h2>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} className={cls} placeholder="Additional notes about this deal..." />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
              {loading ? 'Creating...' : 'Create Deal'}
            </button>
            <Link to="/deals" className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
      )
}
