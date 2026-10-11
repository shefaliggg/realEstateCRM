import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { Modal, Field, inputCls, selectCls } from './editShared'

export default function UnitCustomerModal({ projectId, unit, status, onClose, onConfirm }) {
  const [customers, setCustomers] = useState([])
  const [leads, setLeads] = useState([])
  const [leadId, setLeadId] = useState('')
  const [mode, setMode] = useState(unit.currentCustomer ? 'existing' : 'lead')
  const [customerId, setCustomerId] = useState(unit.currentCustomer?._id || '')
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/customers').then((res) => setCustomers(res.data || [])).catch(() => {})
    api.get(`/leads?project=${projectId}`).then((res) => setLeads(res.data || [])).catch(() => {})
  }, [projectId])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    let payload
    if (mode === 'lead') {
      if (!leadId) return setError('Select a lead')
      payload = { leadId }
    } else if (mode === 'existing') {
      if (!customerId) return setError('Select a customer')
      payload = { customerId }
    } else {
      if (!form.name.trim()) return setError('Name is required')
      if (form.phone.replace(/\D/g, '').length < 10) return setError('Enter a valid phone number (at least 10 digits)')
      payload = { customerName: form.name.trim(), customerPhone: form.phone.trim(), customerEmail: form.email.trim() }
    }
    setBusy(true)
    try {
      await onConfirm(payload)
    } catch (err) {
      const dup = err.response?.status === 409 ? err.response.data.customer : null
      if (dup) {
        setCustomers((list) => (list.some((c) => c._id === dup._id) ? list : [dup, ...list]))
        setCustomerId(dup._id)
        setMode('existing')
      }
      setError(dup ? `${err.response.data.message}. Selected below — click Mark ${status} to use them.` : (err.response?.data?.message || 'Failed to update unit'))
      setBusy(false)
    }
  }

  return (
    <Modal title={`Mark ${unit.block}-${unit.unitNo} as ${status}`} icon="👤" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="flex gap-2">
          {[['lead', 'From a lead'], ['existing', 'Existing customer'], ['new', 'New customer']].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setMode(key)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium ${mode === key ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'lead' ? (
          <Field label="Lead" hint={leads.length === 0 ? 'No leads found for this project.' : undefined}>
            <select value={leadId} onChange={(e) => setLeadId(e.target.value)} className={selectCls}>
              <option value="">Select lead…</option>
              {leads.map((l) => <option key={l._id} value={l._id}>{l.name} — {l.phone}{l.customer ? ' (already a customer)' : ''}</option>)}
            </select>
          </Field>
        ) : mode === 'existing' ? (
          <Field label="Customer">
            <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={selectCls}>
              <option value="">Select customer…</option>
              {customers.map((c) => <option key={c._id} value={c._id}>{c.name} — {c.phone}</option>)}
            </select>
          </Field>
        ) : (
          <>
            <Field label="Name"><input className={inputCls} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="Phone *"><input className={inputCls} value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} /></Field>
            <Field label="Email (optional)"><input type="email" className={inputCls} value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></Field>
          </>
        )}

        {status === 'Booked' && <p className="text-xs text-gray-500">A booking will also be created for this customer at the unit's total price.</p>}
        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-700">Cancel</button>
          <button type="submit" disabled={busy} className="text-sm font-medium px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50">
            {busy ? 'Saving…' : `Mark ${status}`}
          </button>
        </div>
      </form>
    </Modal>
  )
}
