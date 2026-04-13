import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

const BLOCK_PRESETS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const BHK_TYPES = ['2 BHK', '2.5 BHK', '3 BHK']

export default function AddProjectPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    developerName: '',
    type: 'Apartments',
    status: 'Under Construction',
    reraNo: '',
    totalUnits: '',
    locality: '',
    city: '',
    launchDate: '',
    possessionDate: '',
    blocks: [],
    bhkTypes: [],
    amenities: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [newBlock, setNewBlock] = useState('')

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const addBlock = b => {
    const value = String(b || '').trim()
    if (!value) return
    setForm(f => {
      const exists = f.blocks.some(x => x.toLowerCase() === value.toLowerCase())
      if (exists) return f
      return { ...f, blocks: [...f.blocks, value] }
    })
  }

  const removeBlock = b => {
    setForm(f => ({ ...f, blocks: f.blocks.filter(x => x !== b) }))
  }

  const toggleBhk = b => {
    setForm(f => ({
      ...f,
      bhkTypes: f.bhkTypes.includes(b) ? f.bhkTypes.filter(x => x !== b) : [...f.bhkTypes, b],
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.developerName) {
      setError('Project name and developer name are required')
      return
    }
    if (form.blocks.length === 0) {
      setError('Add at least one block')
      return
    }
    setLoading(true)
    try {
      const payload = {
        ...form,
        blocks: [...new Set(form.blocks.map(b => b.trim()).filter(Boolean))],
        totalUnits: form.totalUnits ? Number(form.totalUnits) : undefined,
        location: { locality: form.locality, city: form.city },
        amenities: form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
      }
      delete payload.locality
      delete payload.city
      const res = await api.post('/projects', payload)
      navigate(`/projects/${res.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project')
    } finally {
      setLoading(false)
    }
  }

  return (
          <div className="p-6 max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/projects" className="hover:text-primary-600">Projects</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Add Project</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">🏗️ Add New Project</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">📋 Basic Information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input name="name" value={form.name} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="VMR AZURE" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Developer Name *</label>
                <input name="developerName" value={form.developerName} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="VMR Developers" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="type" value={form.type} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                  {['Apartments', 'Villas', 'Plots', 'Commercial', 'Mixed Use'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select name="status" value={form.status} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                  {['Pre-Launch', 'Launched', 'Under Construction', 'Ready to Move', 'Completed'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">RERA No.</label>
                <input name="reraNo" value={form.reraNo} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="P02400001234" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Units</label>
                <input name="totalUnits" value={form.totalUnits} onChange={handleChange} type="number" min="1"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="632" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">📍 Location</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locality</label>
                <input name="locality" value={form.locality} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="Gachibowli" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input name="city" value={form.city} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="Hyderabad" />
              </div>
            </div>
          </div>

          {/* Blocks */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">🏢 Blocks</h2>
            <div className="flex flex-wrap gap-2 mb-3">
              {BLOCK_PRESETS.map(b => (
                <button
                  type="button"
                  key={b}
                  onClick={() => addBlock(b)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  + {b}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mb-3">
              <input
                value={newBlock}
                onChange={e => setNewBlock(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                placeholder="Add custom block name (e.g. Tower-1, Podium)"
              />
              <button
                type="button"
                onClick={() => {
                  addBlock(newBlock)
                  setNewBlock('')
                }}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.blocks.length === 0 && <span className="text-xs text-gray-400">No blocks added yet</span>}
              {form.blocks.map(b => (
                <span key={b} className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                  {b}
                  <button
                    type="button"
                    onClick={() => removeBlock(b)}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    x
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* BHK Types */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">🛏 BHK Types</h2>
            <div className="flex flex-wrap gap-2">
              {BHK_TYPES.map(b => (
                <button type="button" key={b} onClick={() => toggleBhk(b)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    form.bhkTypes.includes(b)
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">📅 Timeline</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Launch Date</label>
                <input name="launchDate" value={form.launchDate} onChange={handleChange} type="date"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Possession Date</label>
                <input name="possessionDate" value={form.possessionDate} onChange={handleChange} type="date"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300" />
              </div>
            </div>
          </div>

          {/* Amenities & Description */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">🏊 Amenities & Description</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amenities <span className="text-gray-400">(comma-separated)</span></label>
                <input name="amenities" value={form.amenities} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="Swimming Pool, Gym, Club House, Kids Play Area" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 resize-none"
                  placeholder="Brief description of the project..." />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
            <Link to="/projects" className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
      )
}
