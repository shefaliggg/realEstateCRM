import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import api from '../api/axios'
import { amenityIcon } from './projectDetail/shared'
import { SpecSelectField } from './projectDetail/editShared'
import {
  TOWER_AMENITY_LIST, STRUCTURE_OPTIONS, FLOORING_OPTIONS, KITCHEN_OPTIONS, BATHROOM_OPTIONS,
  DOORS_OPTIONS, WINDOWS_OPTIONS, ELECTRICAL_OPTIONS, PLUMBING_OPTIONS, PAINT_OPTIONS,
} from './projectDetail/projectFieldOptions'

const STATUS_OPTIONS = ['Planned', 'Under Construction', 'Ready']
const FEATURES = [
  ['serviceLift', 'Service Lift'],
  ['passengerLift', 'Passenger Lift'],
  ['generatorBackup', 'Generator Backup'],
  ['cctv', 'CCTV'],
  ['fireSafety', 'Fire Safety'],
  ['garbageChute', 'Garbage Chute'],
  ['wheelchairAccess', 'Wheelchair Access'],
]

const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition'
const selectCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-700'

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
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
  name: '', code: '', status: 'Planned', numberOfFloors: '', numberOfBasements: '', numberOfLifts: '', numberOfFlats: '', possessionDate: '',
  constructionStartDate: '', completionDate: '', occupancyCertificate: false, fireNOC: false,
  serviceLift: false, passengerLift: false, generatorBackup: false, cctv: false, fireSafety: false, garbageChute: false, wheelchairAccess: false,
  siteEngineer: '', salesManager: '',
  amenities: [], structure: '', flooring: '', kitchen: '', bathroom: '', doors: '', windows: '', electrical: '', plumbing: '', paint: '',
}

export default function AddTowerPage() {
  const { projectId, towerId } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = Boolean(towerId)
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [form, setForm] = useState(() => (isEdit ? EMPTY_FORM : { ...EMPTY_FORM, name: searchParams.get('name') || '' }))
  const [files, setFiles] = useState({ floorPlans: [], towerLayout: null, elevationDrawing: null })
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get(`/projects/${projectId}`).then((r) => setProject(r.data)).catch(() => {})
    api.get('/users').then((r) => setUsers(r.data)).catch(() => {})
  }, [projectId])

  useEffect(() => {
    if (!isEdit) return
    api.get(`/towers/${towerId}`).then((r) => {
      const t = r.data
      const specs = t.specifications || {}
      setForm({
        name: t.name || '', code: t.code || '', status: t.status || 'Planned',
        numberOfFloors: t.numberOfFloors ?? '', numberOfBasements: t.numberOfBasements ?? '', numberOfLifts: t.numberOfLifts ?? '', numberOfFlats: t.numberOfFlats ?? '',
        possessionDate: t.possessionDate ? t.possessionDate.slice(0, 10) : '',
        constructionStartDate: t.constructionStartDate ? t.constructionStartDate.slice(0, 10) : '',
        completionDate: t.completionDate ? t.completionDate.slice(0, 10) : '',
        occupancyCertificate: Boolean(t.occupancyCertificate), fireNOC: Boolean(t.fireNOC),
        serviceLift: Boolean(t.features?.serviceLift), passengerLift: Boolean(t.features?.passengerLift),
        generatorBackup: Boolean(t.features?.generatorBackup), cctv: Boolean(t.features?.cctv),
        fireSafety: Boolean(t.features?.fireSafety), garbageChute: Boolean(t.features?.garbageChute),
        wheelchairAccess: Boolean(t.features?.wheelchairAccess),
        siteEngineer: t.siteEngineer?._id || '', salesManager: t.salesManager?._id || '',
        amenities: t.amenities || [],
        structure: specs.structure || '', flooring: specs.flooring || '', kitchen: specs.kitchen || '', bathroom: specs.bathroom || '',
        doors: specs.doors || '', windows: specs.windows || '', electrical: specs.electrical || '', plumbing: specs.plumbing || '', paint: specs.paint || '',
      })
    }).catch(() => setError('Failed to load tower'))
  }, [isEdit, towerId])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const onChange = (key) => (e) => set(key, e.target.value)
  const toggleAmenity = (a) => setForm((f) => ({ ...f, amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a] }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Tower name is required'); return }
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      const append = (key, value) => { if (value !== '' && value !== undefined && value !== null) fd.append(key, value) }
      append('name', form.name)
      append('code', form.code)
      append('status', form.status)
      append('numberOfFloors', form.numberOfFloors)
      append('numberOfBasements', form.numberOfBasements)
      append('numberOfLifts', form.numberOfLifts)
      append('numberOfFlats', form.numberOfFlats)
      append('possessionDate', form.possessionDate)
      append('constructionStartDate', form.constructionStartDate)
      append('completionDate', form.completionDate)
      fd.append('occupancyCertificate', String(form.occupancyCertificate))
      fd.append('fireNOC', String(form.fireNOC))
      FEATURES.forEach(([key]) => fd.append(key, String(form[key])))
      append('siteEngineer', form.siteEngineer)
      append('salesManager', form.salesManager)
      fd.append('amenities', JSON.stringify(form.amenities))
      append('structure', form.structure)
      append('flooring', form.flooring)
      append('kitchen', form.kitchen)
      append('bathroom', form.bathroom)
      append('doors', form.doors)
      append('windows', form.windows)
      append('electrical', form.electrical)
      append('plumbing', form.plumbing)
      append('paint', form.paint)
      if (files.towerLayout) fd.append('towerLayout', files.towerLayout)
      if (files.elevationDrawing) fd.append('elevationDrawing', files.elevationDrawing)
      files.floorPlans.forEach((f) => fd.append('floorPlans', f))

      if (isEdit) {
        await api.put(`/projects/${projectId}/towers/${towerId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        await api.post(`/projects/${projectId}/towers`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      navigate(`/projects/${projectId}`)
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} tower`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to={`/projects/${projectId}`} className="hover:text-primary-600">{project?.name || 'Project'}</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{isEdit ? 'Edit Tower' : 'Add Tower'}</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">🏢 {isEdit ? 'Edit Tower' : 'Add Tower'}</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard title="Basic Information" icon="📋">
          <Field label="Project"><input value={project?.name || ''} disabled className={`${inputCls} bg-gray-50 text-gray-500`} /></Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Tower Name" required><input value={form.name} onChange={onChange('name')} className={inputCls} placeholder="A, B, Magnolia..." /></Field>
            <Field label="Tower Code"><input value={form.code} onChange={onChange('code')} className={inputCls} placeholder="TWR-A" /></Field>
            <Field label="Tower Status">
              <select value={form.status} onChange={onChange('status')} className={selectCls}>
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Number of Floors" required><input type="number" value={form.numberOfFloors} onChange={onChange('numberOfFloors')} className={inputCls} /></Field>
            <Field label="Number of Basements"><input type="number" value={form.numberOfBasements} onChange={onChange('numberOfBasements')} className={inputCls} /></Field>
            <Field label="Number of Lifts"><input type="number" value={form.numberOfLifts} onChange={onChange('numberOfLifts')} className={inputCls} /></Field>
            <Field label="Number of Flats"><input type="number" value={form.numberOfFlats} onChange={onChange('numberOfFlats')} className={inputCls} /></Field>
            <Field label="Possession Date"><input type="date" value={form.possessionDate} onChange={onChange('possessionDate')} className={inputCls} /></Field>
          </div>
        </SectionCard>

        <SectionCard title="Construction Details" icon="🏗️">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Construction Start Date"><input type="date" value={form.constructionStartDate} onChange={onChange('constructionStartDate')} className={inputCls} /></Field>
            <Field label="Completion Date"><input type="date" value={form.completionDate} onChange={onChange('completionDate')} className={inputCls} /></Field>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.occupancyCertificate} onChange={(e) => set('occupancyCertificate', e.target.checked)} className="w-4 h-4 accent-primary-600" />
              <span className="text-sm text-gray-600">Occupancy Certificate obtained</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.fireNOC} onChange={(e) => set('fireNOC', e.target.checked)} className="w-4 h-4 accent-primary-600" />
              <span className="text-sm text-gray-600">Fire NOC obtained</span>
            </label>
          </div>
        </SectionCard>

        <SectionCard title="Tower Features" icon="✨">
          <div className="flex flex-wrap gap-2">
            {FEATURES.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => set(key, !form[key])}
                className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${
                  form[key] ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                }`}
              >
                {form[key] && <span className="mr-1">✓</span>}{label}
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Tower-Specific Amenities" icon="🏊">
          <div className="flex flex-wrap gap-2">
            {TOWER_AMENITY_LIST.map((a) => {
              const selected = form.amenities.includes(a)
              return (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${
                    selected ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-700'
                  }`}>
                  <span className="mr-1">{amenityIcon(a)}</span>{a}
                </button>
              )
            })}
          </div>
        </SectionCard>

        <SectionCard title="Specifications" icon="🧱">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SpecSelectField label="Structure" value={form.structure} onChange={(v) => set('structure', v)} options={STRUCTURE_OPTIONS} />
            <SpecSelectField label="Flooring" value={form.flooring} onChange={(v) => set('flooring', v)} options={FLOORING_OPTIONS} />
            <SpecSelectField label="Kitchen" value={form.kitchen} onChange={(v) => set('kitchen', v)} options={KITCHEN_OPTIONS} />
            <SpecSelectField label="Bathroom" value={form.bathroom} onChange={(v) => set('bathroom', v)} options={BATHROOM_OPTIONS} />
            <SpecSelectField label="Doors" value={form.doors} onChange={(v) => set('doors', v)} options={DOORS_OPTIONS} />
            <SpecSelectField label="Windows" value={form.windows} onChange={(v) => set('windows', v)} options={WINDOWS_OPTIONS} />
            <SpecSelectField label="Electrical" value={form.electrical} onChange={(v) => set('electrical', v)} options={ELECTRICAL_OPTIONS} />
            <SpecSelectField label="Plumbing" value={form.plumbing} onChange={(v) => set('plumbing', v)} options={PLUMBING_OPTIONS} />
            <SpecSelectField label="Paint" value={form.paint} onChange={(v) => set('paint', v)} options={PAINT_OPTIONS} />
          </div>
        </SectionCard>

        <SectionCard title="Documents" icon="📄">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Floor Plans">
              <input type="file" multiple accept="image/*,application/pdf" onChange={(e) => setFiles((f) => ({ ...f, floorPlans: Array.from(e.target.files || []) }))} className="text-sm" />
            </Field>
            <Field label="Tower Layout">
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setFiles((f) => ({ ...f, towerLayout: e.target.files?.[0] || null }))} className="text-sm" />
            </Field>
            <Field label="Elevation Drawing">
              <input type="file" accept="image/*,application/pdf" onChange={(e) => setFiles((f) => ({ ...f, elevationDrawing: e.target.files?.[0] || null }))} className="text-sm" />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Assigned Team" icon="👷">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Site Engineer">
              <select value={form.siteEngineer} onChange={onChange('siteEngineer')} className={selectCls}>
                <option value="">Select</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </Field>
            <Field label="Sales Manager">
              <select value={form.salesManager} onChange={onChange('salesManager')} className={selectCls}>
                <option value="">Select</option>
                {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
              </select>
            </Field>
          </div>
        </SectionCard>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
            {loading ? (isEdit ? 'Saving...' : 'Creating...') : isEdit ? 'Save Changes' : 'Create Tower'}
          </button>
          <Link to={`/projects/${projectId}`} className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
