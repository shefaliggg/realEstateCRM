import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/axios'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('blocks')
  const [newBlock, setNewBlock] = useState('')
  const [addingBlock, setAddingBlock] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/units`),
    ])
      .then(([pRes, uRes]) => {
        setProject(pRes.data)
        setUnits(uRes.data)
      })
      .catch(() => setError('Failed to load project'))
      .finally(() => setLoading(false))
  }, [id])

  const blocks = project?.blocks || []

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>
  if (error) return <div className="p-6 text-red-500">{error}</div>
  if (!project) return null

  const stats = {
    total: units.length,
    available: units.filter(u => u.status === 'Available').length,
    reserved: units.filter(u => u.status === 'Reserved').length,
    booked: units.filter(u => u.status === 'Booked').length,
    registered: units.filter(u => u.status === 'Registered').length,
  }

  const handleAddBlock = async () => {
    const value = newBlock.trim()
    if (!value || addingBlock) return
    if (blocks.some(b => b.toLowerCase() === value.toLowerCase())) return

    setAddingBlock(true)
    try {
      const updatedBlocks = [...blocks, value]
      const res = await api.put(`/projects/${id}`, { blocks: updatedBlocks })
      setProject(prev => ({ ...prev, ...res.data }))
      setNewBlock('')
    } catch {
      setError('Failed to add block')
    } finally {
      setAddingBlock(false)
    }
  }

  return (
          <div className="p-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/projects" className="hover:text-primary-600">Projects</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{project.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-500">{project.developerName} · {project.location?.city}</p>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/projects/${id}/units/add`}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Add Unit
            </Link>
            <Link
              to={`/projects/edit/${id}`}
              className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Edit
            </Link>
          </div>
        </div>

        {/* Stats chips */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { label: 'Total', val: stats.total, color: 'bg-gray-100 text-gray-700' },
            { label: 'Available', val: stats.available, color: 'bg-green-100 text-green-700' },
            { label: 'Reserved', val: stats.reserved, color: 'bg-yellow-100 text-yellow-700' },
            { label: 'Booked', val: stats.booked, color: 'bg-orange-100 text-orange-700' },
            { label: 'Registered', val: stats.registered, color: 'bg-blue-100 text-blue-700' },
          ].map(s => (
            <div key={s.label} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${s.color}`}>
              {s.label}: <span className="font-bold">{s.val}</span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-5">
          {['blocks', 'overview'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'blocks' && (
          <div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-4">
              <div className="flex flex-wrap gap-2">
                <input
                  value={newBlock}
                  onChange={e => setNewBlock(e.target.value)}
                  placeholder="Add block name (e.g. B, Tower-1, Podium)"
                  className="flex-1 min-w-[220px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                />
                <button
                  type="button"
                  onClick={handleAddBlock}
                  disabled={addingBlock || !newBlock.trim()}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {addingBlock ? 'Adding...' : '+ Add Block'}
                </button>
              </div>
            </div>

            {blocks.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                No blocks configured.{' '}
                <Link to={`/projects/edit/${id}`} className="text-primary-600 hover:underline">Edit project</Link> to add blocks.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {blocks.map(b => {
                  const bu = units.filter(u => u.block === b)
                  const bTotal = bu.length || 1
                  const bAvail = bu.filter(u => u.status === 'Available').length
                  const bReserved = bu.filter(u => u.status === 'Reserved').length
                  const bBooked = bu.filter(u => u.status === 'Booked').length
                  const bReg = bu.filter(u => u.status === 'Registered').length
                  return (
                    <Link
                      key={b}
                      to={`/projects/${id}/blocks/${encodeURIComponent(b)}`}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-primary-200 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center shrink-0">
                          <span className="text-primary-700 font-bold text-xs">Blk {b}</span>
                        </div>
                        <span className="text-xs text-gray-400">{bu.length} flats</span>
                      </div>
                      <div className="flex h-1.5 rounded-full overflow-hidden mb-3">
                        <div className="bg-green-400" style={{ width: `${(bAvail / bTotal) * 100}%` }} />
                        <div className="bg-yellow-400" style={{ width: `${(bReserved / bTotal) * 100}%` }} />
                        <div className="bg-orange-400" style={{ width: `${(bBooked / bTotal) * 100}%` }} />
                        <div className="bg-blue-400" style={{ width: `${(bReg / bTotal) * 100}%` }} />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-green-600 font-medium">{bAvail} avail</span>
                        <span className="text-orange-600 font-medium">{bBooked} booked</span>
                      </div>
                    </Link>
                  )
                })}
                {/* Quick-add tile */}
                <Link
                  to={`/projects/${id}/units/add`}
                  className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-primary-300 hover:bg-primary-50/30 transition-all min-h-[120px]"
                >
                  <span className="text-2xl text-gray-300">+</span>
                  <span className="text-sm font-medium text-gray-400">Add Flat</span>
                </Link>
              </div>
            )}
          </div>
        )}

        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-800 mb-3">📋 Project Details</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between"><dt className="text-gray-500">Type</dt><dd className="font-medium">{project.type}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd className="font-medium">{project.status}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">RERA No.</dt><dd className="font-medium">{project.reraNo || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Location</dt><dd className="font-medium">{[project.location?.locality, project.location?.city].filter(Boolean).join(', ') || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Total Units</dt><dd className="font-medium">{project.totalUnits}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">Blocks</dt><dd className="font-medium">{project.blocks?.join(', ') || '—'}</dd></div>
                <div className="flex justify-between"><dt className="text-gray-500">BHK Types</dt><dd className="font-medium">{project.bhkTypes?.join(', ') || '—'}</dd></div>
              </dl>
            </div>
            {project.amenities?.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-semibold text-gray-800 mb-3">🏊 Amenities</h3>
                <div className="flex flex-wrap gap-2">
                  {project.amenities.map(a => (
                    <span key={a} className="bg-blue-50 text-blue-700 text-xs px-2.5 py-1 rounded-full">{a}</span>
                  ))}
                </div>
              </div>
            )}
            {project.description && (
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:col-span-2">
                <h3 className="font-semibold text-gray-800 mb-2">📝 Description</h3>
                <p className="text-sm text-gray-600 whitespace-pre-line">{project.description}</p>
              </div>
            )}
          </div>
        )}
      </div>
      )
}
