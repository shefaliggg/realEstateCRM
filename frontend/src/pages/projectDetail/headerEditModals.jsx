import { useState } from 'react'
import { EditModal, Field, inputCls, selectCls, useProjectSave, buildFormData } from './editShared'
import { STATUS_OPTIONS } from './projectFieldOptions'

const toDateInput = (v) => (v ? new Date(v).toISOString().slice(0, 10) : '')

export function EditCoverPhotoModal({ id, project, onClose, onSaved }) {
  const { save, saving, error } = useProjectSave(id, onSaved)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(project.coverImage || '')

  const onPick = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { onClose(); return }
    const ok = await save(buildFormData({}, { coverImage: file }), { multipart: true })
    if (ok) onClose()
  }

  return (
    <EditModal title="Cover Photo" icon="🖼️" onClose={onClose} onSubmit={handleSubmit} saving={saving} error={error} submitLabel="Save Cover Photo">
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-slate-50 h-40 flex items-center justify-center">
        {preview ? <img src={preview} alt="Cover preview" className="h-full w-full object-cover" /> : <span className="text-sm text-gray-400">No cover photo yet</span>}
      </div>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 hover:border-primary-300 hover:bg-primary-50/40 transition-colors">
        <input type="file" accept="image/*" onChange={onPick} className="hidden" />
        <span className="text-sm font-medium text-gray-700">Choose Photo</span>
      </label>
    </EditModal>
  )
}

export function EditLogoModal({ id, project, onClose, onSaved }) {
  const { save, saving, error } = useProjectSave(id, onSaved)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(project.logo || '')

  const onPick = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) { onClose(); return }
    const ok = await save(buildFormData({}, { logo: file }), { multipart: true })
    if (ok) onClose()
  }

  return (
    <EditModal title="Project Logo" icon="🖼️" onClose={onClose} onSubmit={handleSubmit} saving={saving} error={error} submitLabel="Save Logo">
      <div className="rounded-xl overflow-hidden border border-gray-200 bg-slate-50 h-28 w-28 mx-auto flex items-center justify-center">
        {preview ? <img src={preview} alt="Logo preview" className="h-full w-full object-cover" /> : <span className="text-xs text-gray-400">No logo yet</span>}
      </div>
      <label className="flex justify-center cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 hover:border-primary-300 hover:bg-primary-50/40 transition-colors">
        <input type="file" accept="image/*" onChange={onPick} className="hidden" />
        <span className="text-sm font-medium text-gray-700">Choose Logo</span>
      </label>
    </EditModal>
  )
}

export function EditHeaderInfoModal({ id, project, onClose, onSaved }) {
  const { save, saving, error } = useProjectSave(id, onSaved)
  const [form, setForm] = useState({
    name: project.name || '', developerName: project.developerName || '', status: project.status || 'Pre-Launch',
    reraNo: project.reraNo || '', reraRegistrationDate: toDateInput(project.reraRegistrationDate),
    launchDate: toDateInput(project.launchDate), constructionStartDate: toDateInput(project.constructionStartDate),
    possessionDate: toDateInput(project.possessionDate), totalLandArea: project.totalLandArea || '',
    numberOfTowers: project.numberOfTowers || '', numberOfFloors: project.numberOfFloors || '',
  })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await save({ ...form })
    if (ok) onClose()
  }

  return (
    <EditModal title="Project Info" icon="📋" onClose={onClose} onSubmit={handleSubmit} saving={saving} error={error} wide>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Project Name"><input value={form.name} onChange={set('name')} className={inputCls} /></Field>
        <Field label="Developer / Builder"><input value={form.developerName} onChange={set('developerName')} className={inputCls} /></Field>
        <Field label="Status">
          <select value={form.status} onChange={set('status')} className={selectCls}>
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="RERA Number"><input value={form.reraNo} onChange={set('reraNo')} className={inputCls} /></Field>
        <Field label="RERA Registration Date"><input type="date" value={form.reraRegistrationDate} onChange={set('reraRegistrationDate')} className={inputCls} /></Field>
        <Field label="Launch Date"><input type="date" value={form.launchDate} onChange={set('launchDate')} className={inputCls} /></Field>
        <Field label="Construction Start Date"><input type="date" value={form.constructionStartDate} onChange={set('constructionStartDate')} className={inputCls} /></Field>
        <Field label="Possession Date"><input type="date" value={form.possessionDate} onChange={set('possessionDate')} className={inputCls} /></Field>
        <Field label="Total Land Area"><input value={form.totalLandArea} onChange={set('totalLandArea')} className={inputCls} placeholder="5 Acres" /></Field>
        <Field label="Number of Towers"><input type="number" value={form.numberOfTowers} onChange={set('numberOfTowers')} className={inputCls} /></Field>
        <Field label="Number of Floors"><input type="number" value={form.numberOfFloors} onChange={set('numberOfFloors')} className={inputCls} /></Field>
      </div>
    </EditModal>
  )
}

export function EditSalesStatusModal({ id, project, onClose, onSaved }) {
  const { save, saving, error } = useProjectSave(id, onSaved)
  const salesInfo = project.salesInfo || {}
  const [form, setForm] = useState({
    bookingOpen: !!salesInfo.bookingOpen, bankLoanAvailable: !!salesInfo.bankLoanAvailable,
    approvedBanksText: (salesInfo.approvedBanks || []).join(', '),
    salesOfficeAddress: salesInfo.salesOfficeAddress || '', siteOfficeContact: salesInfo.siteOfficeContact || '', crmNotes: salesInfo.crmNotes || '',
  })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await save({
      bookingOpen: String(form.bookingOpen), bankLoanAvailable: String(form.bankLoanAvailable),
      approvedBanks: JSON.stringify(form.approvedBanksText.split(',').map((s) => s.trim()).filter(Boolean)),
      salesOfficeAddress: form.salesOfficeAddress, siteOfficeContact: form.siteOfficeContact, crmNotes: form.crmNotes,
    })
    if (ok) onClose()
  }

  return (
    <EditModal title="Sales Information" icon="💼" onClose={onClose} onSubmit={handleSubmit} saving={saving} error={error}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.bookingOpen} onChange={(e) => setForm((f) => ({ ...f, bookingOpen: e.target.checked }))} className="w-4 h-4 accent-primary-600" />
          <span className="text-sm text-gray-600">Bookings currently open</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.bankLoanAvailable} onChange={(e) => setForm((f) => ({ ...f, bankLoanAvailable: e.target.checked }))} className="w-4 h-4 accent-primary-600" />
          <span className="text-sm text-gray-600">Home loan financing available</span>
        </label>
      </div>
      <Field label="Approved Banks (comma-separated)"><input value={form.approvedBanksText} onChange={set('approvedBanksText')} className={inputCls} placeholder="HDFC, SBI, ICICI" /></Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Sales Office Address"><input value={form.salesOfficeAddress} onChange={set('salesOfficeAddress')} className={inputCls} /></Field>
        <Field label="Site Office Contact"><input value={form.siteOfficeContact} onChange={set('siteOfficeContact')} className={inputCls} /></Field>
      </div>
      <Field label="CRM Notes"><textarea value={form.crmNotes} onChange={set('crmNotes')} rows={3} className={inputCls} /></Field>
    </EditModal>
  )
}
