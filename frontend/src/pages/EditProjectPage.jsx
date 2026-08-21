import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../api/axios'

const STATUS_OPTIONS = ['Pre-Launch', 'New Launch', 'Under Construction', 'Ready to Move', 'Completed', 'Sold Out']

const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition'
const selectCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-700'

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
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

const toDateInput = (v) => (v ? new Date(v).toISOString().slice(0, 10) : '')

export default function EditProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then((res) => {
        const p = res.data
        const salesInfo = p.salesInfo || {}
        const contact = p.contact || {}
        setForm({
          name: p.name || '', developerName: p.developerName || '', description: p.description || '',
          status: p.status || 'Pre-Launch', reraNo: p.reraNo || '',
          reraRegistrationDate: toDateInput(p.reraRegistrationDate), launchDate: toDateInput(p.launchDate),
          possessionDate: toDateInput(p.possessionDate), constructionStartDate: toDateInput(p.constructionStartDate),
          totalLandArea: p.totalLandArea || '', numberOfTowers: p.numberOfTowers || '', numberOfFloors: p.numberOfFloors || '',
          constructionProgressPct: p.constructionProgressPct ?? '',
          bookingOpen: !!salesInfo.bookingOpen, bankLoanAvailable: !!salesInfo.bankLoanAvailable,
          approvedBanksText: (salesInfo.approvedBanks || []).join(', '),
          salesOfficeAddress: salesInfo.salesOfficeAddress || '', siteOfficeContact: salesInfo.siteOfficeContact || '', crmNotes: salesInfo.crmNotes || '',
          salesPhone: contact.salesPhone || '', alternatePhone: contact.alternatePhone || '', whatsapp: contact.whatsapp || '',
          email: contact.email || '', website: contact.website || '',
        })
      })
      .catch(() => setError('Failed to load project'))
      .finally(() => setLoading(false))
  }, [id])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const onChange = (key) => (e) => set(key, e.target.value)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.put(`/projects/${id}`, {
        name: form.name, developerName: form.developerName, description: form.description,
        status: form.status, reraNo: form.reraNo,
        reraRegistrationDate: form.reraRegistrationDate || '', launchDate: form.launchDate || '',
        possessionDate: form.possessionDate || '', constructionStartDate: form.constructionStartDate || '',
        totalLandArea: form.totalLandArea, numberOfTowers: form.numberOfTowers, numberOfFloors: form.numberOfFloors,
        constructionProgressPct: form.constructionProgressPct,
        bookingOpen: String(form.bookingOpen), bankLoanAvailable: String(form.bankLoanAvailable),
        approvedBanks: JSON.stringify(form.approvedBanksText.split(',').map((s) => s.trim()).filter(Boolean)),
        salesOfficeAddress: form.salesOfficeAddress, siteOfficeContact: form.siteOfficeContact, crmNotes: form.crmNotes,
        salesPhone: form.salesPhone, alternatePhone: form.alternatePhone, whatsapp: form.whatsapp,
        email: form.email, website: form.website,
      })
      navigate(`/projects/${id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      await api.delete(`/projects/${id}`)
      navigate('/projects')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project')
      setDeleting(false)
    }
  }

  if (loading) return <div className="p-6 text-gray-400">Loading...</div>
  if (!form) return <div className="p-6 text-red-500">{error || 'Project not found'}</div>

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to={`/projects/${id}`} className="hover:text-primary-600">Project</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Edit</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">✏️ Edit Project</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <SectionCard title="Basic Information" icon="📋">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Project Name"><input value={form.name} onChange={onChange('name')} className={inputCls} /></Field>
            <Field label="Developer / Builder"><input value={form.developerName} onChange={onChange('developerName')} className={inputCls} /></Field>
          </div>
          <Field label="Description"><textarea value={form.description} onChange={onChange('description')} rows={3} className={inputCls} /></Field>
        </SectionCard>

        <SectionCard title="Status & Timeline" icon="🏗️">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Status">
              <select value={form.status} onChange={onChange('status')} className={selectCls}>
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="RERA Number"><input value={form.reraNo} onChange={onChange('reraNo')} className={inputCls} /></Field>
            <Field label="RERA Registration Date"><input type="date" value={form.reraRegistrationDate} onChange={onChange('reraRegistrationDate')} className={inputCls} /></Field>
            <Field label="Launch Date"><input type="date" value={form.launchDate} onChange={onChange('launchDate')} className={inputCls} /></Field>
            <Field label="Construction Start Date"><input type="date" value={form.constructionStartDate} onChange={onChange('constructionStartDate')} className={inputCls} /></Field>
            <Field label="Possession Date"><input type="date" value={form.possessionDate} onChange={onChange('possessionDate')} className={inputCls} /></Field>
            <Field label="Total Land Area"><input value={form.totalLandArea} onChange={onChange('totalLandArea')} className={inputCls} /></Field>
            <Field label="Number of Towers"><input type="number" value={form.numberOfTowers} onChange={onChange('numberOfTowers')} className={inputCls} /></Field>
            <Field label="Number of Floors"><input type="number" value={form.numberOfFloors} onChange={onChange('numberOfFloors')} className={inputCls} /></Field>
            <Field label="Construction Progress (%)">
              <input type="number" min="0" max="100" value={form.constructionProgressPct} onChange={onChange('constructionProgressPct')} className={inputCls} placeholder="e.g. 65" />
            </Field>
          </div>
        </SectionCard>


        <SectionCard title="Sales Information" icon="💼">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.bookingOpen} onChange={(e) => set('bookingOpen', e.target.checked)} className="w-4 h-4 accent-primary-600" />
              <span className="text-sm text-gray-600">Bookings currently open</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.bankLoanAvailable} onChange={(e) => set('bankLoanAvailable', e.target.checked)} className="w-4 h-4 accent-primary-600" />
              <span className="text-sm text-gray-600">Home loan financing available</span>
            </label>
            <Field label="Approved Banks (comma-separated)"><input value={form.approvedBanksText} onChange={onChange('approvedBanksText')} className={inputCls} placeholder="HDFC, SBI, ICICI" /></Field>
            <Field label="Sales Office Address"><input value={form.salesOfficeAddress} onChange={onChange('salesOfficeAddress')} className={inputCls} /></Field>
            <Field label="Site Office Contact"><input value={form.siteOfficeContact} onChange={onChange('siteOfficeContact')} className={inputCls} /></Field>
          </div>
          <Field label="CRM Notes"><textarea value={form.crmNotes} onChange={onChange('crmNotes')} rows={3} className={inputCls} /></Field>
        </SectionCard>

        <SectionCard title="Contact Details" icon="📞">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Sales Phone"><input value={form.salesPhone} onChange={onChange('salesPhone')} className={inputCls} /></Field>
            <Field label="Alternate Phone"><input value={form.alternatePhone} onChange={onChange('alternatePhone')} className={inputCls} /></Field>
            <Field label="WhatsApp"><input value={form.whatsapp} onChange={onChange('whatsapp')} className={inputCls} /></Field>
            <Field label="Email"><input type="email" value={form.email} onChange={onChange('email')} className={inputCls} /></Field>
            <div className="sm:col-span-2"><Field label="Website"><input value={form.website} onChange={onChange('website')} className={inputCls} /></Field></div>
          </div>
        </SectionCard>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link to={`/projects/${id}`} className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
            Cancel
          </Link>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h3 className="font-semibold text-red-800 mb-1">Danger Zone</h3>
          <p className="text-sm text-red-600 mb-3">Deleting a project permanently removes it. This cannot be undone.</p>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : confirmDelete ? 'Click again to confirm delete' : 'Delete Project'}
          </button>
        </div>
      </form>
    </div>
  )
}
