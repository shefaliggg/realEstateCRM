import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'

const FACING = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West']
const BHK_TYPES = ['Studio', '1 BHK', '1.5 BHK', '2 BHK', '2.5 BHK', '3 BHK', '3.5 BHK', '4 BHK', '4.5 BHK', '5 BHK', 'Duplex', 'Penthouse']

const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300'

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h2 className="font-semibold text-gray-800">{icon} {title}</h2>
      {children}
    </div>
  )
}

const EMPTY_FORM = {
  block: '', floor: '', unitNo: '',
  bhkType: '2 BHK', facing: '', cornerUnit: false,
  carpetArea: '', builtUpArea: '', superBuiltUpArea: '', balconyArea: '',
  basePrice: '', pricePerSqft: '', plc: '', floorRise: '', parkingCharges: '', clubCharges: '', otherCharges: '',
  parkingIncluded: false, parkingNumber: '',
  possessionStatus: 'Under Construction',
  status: 'Available',
}

export default function AddUnitPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const blockFromUrl = searchParams.get('block') || ''
  const [project, setProject] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_FORM, block: blockFromUrl })
  const [files, setFiles] = useState({ floorPlan: null, priceSheet: null })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const isPlotProject = project?.type === 'Plots'

  useEffect(() => {
    api.get(`/projects/${projectId}`)
      .then(r => {
        setProject(r.data)
        if (r.data.type === 'Plots') {
          setForm((f) => ({ ...f, block: 'PLOT', floor: '0', bhkType: 'Plot' }))
          return
        }
        if (!blockFromUrl && r.data.blocks?.length > 0) setForm(f => ({ ...f, block: r.data.blocks[0] }))
        if (r.data.bhkTypes?.length > 0) setForm(f => ({ ...f, bhkType: r.data.bhkTypes[0] }))
      })
      .catch(() => setError('Failed to load project'))
  }, [projectId])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const handleChange = (e) => {
    const { name, value } = e.target
    set(name, value)
  }

  const totalPricePreview = ['basePrice', 'plc', 'floorRise', 'parkingCharges', 'clubCharges', 'otherCharges'].some((k) => form[k])
    ? ['basePrice', 'plc', 'floorRise', 'parkingCharges', 'clubCharges', 'otherCharges'].reduce((sum, k) => sum + (Number(form[k]) || 0), 0)
    : null

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (isPlotProject && !form.unitNo) {
      setError('Plot number is required')
      return
    }
    if (!isPlotProject && (!form.block || !form.floor || !form.unitNo)) {
      setError('Block, floor and unit number are required')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      const append = (key, value) => { if (value !== '' && value !== undefined && value !== null) fd.append(key, value) }

      append('block', isPlotProject ? (form.block || 'PLOT') : form.block)
      append('floor', isPlotProject ? 0 : form.floor)
      append('unitNo', form.unitNo)
      append('bhkType', isPlotProject ? (form.bhkType || 'Plot') : form.bhkType)
      append('facing', form.facing)
      fd.append('cornerUnit', String(form.cornerUnit))

      append('carpetArea', form.carpetArea)
      append('builtUpArea', form.builtUpArea)
      append('superBuiltUpArea', form.superBuiltUpArea)
      append('balconyArea', form.balconyArea)

      append('basePrice', form.basePrice)
      append('pricePerSqft', form.pricePerSqft)
      append('plc', form.plc)
      append('floorRise', form.floorRise)
      append('parkingCharges', form.parkingCharges)
      append('clubCharges', form.clubCharges)
      append('otherCharges', form.otherCharges)

      fd.append('parkingIncluded', String(form.parkingIncluded))
      append('parkingNumber', form.parkingNumber)
      append('possessionStatus', form.possessionStatus)
      append('status', form.status)
      if (files.floorPlan) fd.append('floorPlan', files.floorPlan)
      if (files.priceSheet) fd.append('priceSheet', files.priceSheet)

      await api.post(`/projects/${projectId}/units`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      navigate(blockFromUrl ? `/projects/${projectId}/blocks/${blockFromUrl}` : `/projects/${projectId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create unit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/projects" className="hover:text-primary-600">Projects</Link>
        {project && (
          <>
            <span>/</span>
            <Link to={`/projects/${projectId}`} className="hover:text-primary-600">{project.name}</Link>
          </>
        )}
        {blockFromUrl && (
          <>
            <span>/</span>
            <Link to={`/projects/${projectId}/blocks/${blockFromUrl}`} className="hover:text-primary-600">Block {blockFromUrl}</Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-900 font-medium">{isPlotProject ? 'Add Plot' : 'Add Flat'}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isPlotProject ? '📍 Add Plot' : `🏠 Add Flat${blockFromUrl ? ` — Block ${blockFromUrl}` : ''}`}
      </h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard title="Basic" icon="📐">
          <div className="grid grid-cols-2 gap-4">
            {!isPlotProject && (
              <>
                <Field label="Block *">
                  {blockFromUrl ? (
                    <div className={`${inputCls} bg-gray-50 text-gray-700`}>Block {blockFromUrl}</div>
                  ) : project?.blocks?.length > 0 ? (
                    <select name="block" value={form.block} onChange={handleChange} className={inputCls}>
                      {project.blocks.map(b => <option key={b} value={b}>Block {b}</option>)}
                    </select>
                  ) : (
                    <input name="block" value={form.block} onChange={handleChange} required className={inputCls} placeholder="A" />
                  )}
                </Field>
                <Field label="Floor *">
                  <input name="floor" value={form.floor} onChange={handleChange} type="number" min="0" required className={inputCls} placeholder="3" />
                </Field>
              </>
            )}
            <Field label={isPlotProject ? 'Plot No. *' : 'Flat Number *'}>
              <input name="unitNo" value={form.unitNo} onChange={handleChange} required className={inputCls} placeholder={isPlotProject ? 'P-101' : '301'} />
            </Field>
          </div>
        </SectionCard>

        {!isPlotProject && (
          <SectionCard title="Configuration" icon="🛏">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Unit Type">
                <select name="bhkType" value={form.bhkType} onChange={handleChange} className={inputCls}>
                  {(project?.bhkTypes?.length ? project.bhkTypes : BHK_TYPES).map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </Field>
              <Field label="Facing">
                <select name="facing" value={form.facing} onChange={handleChange} className={inputCls}>
                  <option value="">Select facing...</option>
                  {FACING.map(f => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Corner Unit">
                <label className="flex items-center gap-2 h-[38px] cursor-pointer">
                  <input type="checkbox" checked={form.cornerUnit} onChange={(e) => set('cornerUnit', e.target.checked)} className="w-4 h-4 accent-primary-600" />
                  <span className="text-sm text-gray-600">This is a corner unit</span>
                </label>
              </Field>
            </div>
          </SectionCard>
        )}

        <SectionCard title="Area" icon="📏">
          <div className="grid grid-cols-2 gap-4">
            <Field label={isPlotProject ? 'Plot Area (sqyd)' : 'Carpet Area (sqft)'}>
              <input name="carpetArea" value={form.carpetArea} onChange={handleChange} type="number" min="0" className={inputCls} placeholder={isPlotProject ? '240' : '1250'} />
            </Field>
            {!isPlotProject && (
              <>
                <Field label="Built-up Area (sqft)">
                  <input name="builtUpArea" value={form.builtUpArea} onChange={handleChange} type="number" min="0" className={inputCls} />
                </Field>
                <Field label="Super Built-up Area (sqft)">
                  <input name="superBuiltUpArea" value={form.superBuiltUpArea} onChange={handleChange} type="number" min="0" className={inputCls} />
                </Field>
                <Field label="Balcony Area (sqft)">
                  <input name="balconyArea" value={form.balconyArea} onChange={handleChange} type="number" min="0" className={inputCls} />
                </Field>
              </>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Pricing" icon="💰">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Base Price (₹)">
              <input name="basePrice" value={form.basePrice} onChange={handleChange} type="number" min="0" className={inputCls} placeholder="7500000" />
            </Field>
            <Field label="Price / Sq.ft (₹)">
              <input name="pricePerSqft" value={form.pricePerSqft} onChange={handleChange} type="number" min="0" className={inputCls} />
            </Field>
            <Field label="PLC (₹)">
              <input name="plc" value={form.plc} onChange={handleChange} type="number" min="0" className={inputCls} />
            </Field>
            <Field label="Floor Rise (₹)">
              <input name="floorRise" value={form.floorRise} onChange={handleChange} type="number" min="0" className={inputCls} />
            </Field>
            <Field label="Parking Charges (₹)">
              <input name="parkingCharges" value={form.parkingCharges} onChange={handleChange} type="number" min="0" className={inputCls} />
            </Field>
            <Field label="Club Charges (₹)">
              <input name="clubCharges" value={form.clubCharges} onChange={handleChange} type="number" min="0" className={inputCls} />
            </Field>
            <Field label="Other Charges (₹)">
              <input name="otherCharges" value={form.otherCharges} onChange={handleChange} type="number" min="0" className={inputCls} />
            </Field>
          </div>
          {totalPricePreview !== null && (
            <div className="rounded-lg bg-primary-50 border border-primary-100 px-3 py-2 flex items-center justify-between">
              <span className="text-sm text-primary-700 font-medium">Total Price</span>
              <span className="text-sm font-bold text-primary-800">₹{totalPricePreview.toLocaleString('en-IN')}</span>
            </div>
          )}
        </SectionCard>

        {!isPlotProject && (
          <SectionCard title="Parking" icon="🅿️">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Parking Included">
                <label className="flex items-center gap-2 h-[38px] cursor-pointer">
                  <input type="checkbox" checked={form.parkingIncluded} onChange={(e) => set('parkingIncluded', e.target.checked)} className="w-4 h-4 accent-primary-600" />
                  <span className="text-sm text-gray-600">Parking included with this unit</span>
                </label>
              </Field>
              <Field label="Parking Number">
                <input name="parkingNumber" value={form.parkingNumber} onChange={handleChange} className={inputCls} placeholder="P-104" />
              </Field>
            </div>
          </SectionCard>
        )}

        <SectionCard title="Sales & Possession" icon="🏗️">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Sales Status">
              <select name="status" value={form.status} onChange={handleChange} className={inputCls}>
                {['Available', 'Reserved', 'Booked', 'Registered', 'Cancelled'].map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Possession">
              <select name="possessionStatus" value={form.possessionStatus} onChange={handleChange} className={inputCls}>
                <option>Under Construction</option>
                <option>Ready</option>
              </select>
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Documents" icon="📄">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Floor Plan">
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setFiles((f) => ({ ...f, floorPlan: e.target.files?.[0] || null }))} className="text-sm" />
            </Field>
            <Field label="Price Sheet">
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setFiles((f) => ({ ...f, priceSheet: e.target.files?.[0] || null }))} className="text-sm" />
            </Field>
          </div>
        </SectionCard>

        <div className="flex gap-3">
          <button type="submit" disabled={loading}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
            {loading ? 'Adding...' : isPlotProject ? 'Add Plot' : 'Add Unit'}
          </button>
          <Link to={blockFromUrl ? `/projects/${projectId}/blocks/${blockFromUrl}` : `/projects/${projectId}`}
            className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
