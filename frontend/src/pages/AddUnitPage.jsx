import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

const FACING = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West']

export default function AddUnitPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [form, setForm] = useState({
    block: '',
    floor: '',
    unitNo: '',
    bhkType: '2 BHK',
    carpetArea: '',
    basePrice: '',
    facing: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get(`/projects/${projectId}`)
      .then(r => {
        setProject(r.data)
        if (r.data.blocks?.length > 0) setForm(f => ({ ...f, block: r.data.blocks[0] }))
        if (r.data.bhkTypes?.length > 0) setForm(f => ({ ...f, bhkType: r.data.bhkTypes[0] }))
      })
      .catch(() => setError('Failed to load project'))
  }, [projectId])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.block || !form.floor || !form.unitNo) {
      setError('Block, floor and unit number are required')
      return
    }
    setLoading(true)
    try {
      await api.post(`/projects/${projectId}/units`, {
        ...form,
        floor: Number(form.floor),
        unitNo: form.unitNo,
        carpetArea: form.carpetArea ? Number(form.carpetArea) : undefined,
        basePrice: form.basePrice ? Number(form.basePrice) : undefined,
      })
      navigate(`/projects/${projectId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create unit')
    } finally {
      setLoading(false)
    }
  }

  return (
          <div className="p-6 max-w-lg mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/projects" className="hover:text-primary-600">Projects</Link>
          {project && (
            <>
              <span>/</span>
              <Link to={`/projects/${projectId}`} className="hover:text-primary-600">{project.name}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium">Add Unit</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">🏠 Add Unit</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h2 className="font-semibold text-gray-800 mb-4">📐 Unit Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Block *</label>
                {project?.blocks?.length > 0 ? (
                  <select name="block" value={form.block} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                    {project.blocks.map(b => <option key={b} value={b}>Block {b}</option>)}
                  </select>
                ) : (
                  <input name="block" value={form.block} onChange={handleChange} required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    placeholder="A" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Floor *</label>
                <input name="floor" value={form.floor} onChange={handleChange} type="number" min="0" required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit No. *</label>
                <input name="unitNo" value={form.unitNo} onChange={handleChange} required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="301" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">BHK Type</label>
                {project?.bhkTypes?.length > 0 ? (
                  <select name="bhkType" value={form.bhkType} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                    {project.bhkTypes.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                ) : (
                  <select name="bhkType" value={form.bhkType} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                    {['2 BHK', '2.5 BHK', '3 BHK'].map(b => <option key={b}>{b}</option>)}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Carpet Area (sqft)</label>
                <input name="carpetArea" value={form.carpetArea} onChange={handleChange} type="number" min="0"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="1250" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price (₹)</label>
                <input name="basePrice" value={form.basePrice} onChange={handleChange} type="number" min="0"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="7500000" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Facing</label>
                <select name="facing" value={form.facing} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300">
                  <option value="">Select facing...</option>
                  {FACING.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
              {loading ? 'Adding...' : 'Add Unit'}
            </button>
            <Link to={`/projects/${projectId}`}
              className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
      )
}
