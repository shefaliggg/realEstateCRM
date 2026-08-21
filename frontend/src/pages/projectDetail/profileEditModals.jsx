import { useState } from 'react'
import { EditModal, Field, inputCls, selectCls, useProjectSave } from './editShared'
import { amenityIcon } from './shared'
import { NEARBY_TYPES, INDIA_STATES, COMMON_AMENITY_LIST } from './projectFieldOptions'

export function EditBasicInfoModal({ id, project, onClose, onSaved }) {
  const { save, saving, error } = useProjectSave(id, onSaved)
  const [form, setForm] = useState({
    name: project.name || '', developerName: project.developerName || '', description: project.description || '',
  })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await save({ ...form })
    if (ok) onClose()
  }

  return (
    <EditModal title="Basic Information" icon="📋" onClose={onClose} onSubmit={handleSubmit} saving={saving} error={error}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Project Name"><input value={form.name} onChange={set('name')} className={inputCls} /></Field>
        <Field label="Developer / Builder"><input value={form.developerName} onChange={set('developerName')} className={inputCls} /></Field>
      </div>
      <Field label="Description"><textarea value={form.description} onChange={set('description')} rows={4} className={inputCls} /></Field>
    </EditModal>
  )
}

export function EditLocationModal({ id, project, onClose, onSaved }) {
  const { save, saving, error } = useProjectSave(id, onSaved)
  const location = project.location || {}
  const [form, setForm] = useState({
    country: location.country || 'India', state: location.state || '', city: location.city || '', locality: location.locality || '',
    address: location.address || '', landmark: location.landmark || '', pincode: location.pincode || '', googleMapLink: location.googleMapLink || '',
  })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await save({ ...form })
    if (ok) onClose()
  }

  return (
    <EditModal title="Location" icon="📍" onClose={onClose} onSubmit={handleSubmit} saving={saving} error={error} wide>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Country"><input value={form.country} onChange={set('country')} className={inputCls} /></Field>
        <Field label="State">
          <select value={form.state} onChange={set('state')} className={selectCls}>
            <option value="">Select state</option>
            {INDIA_STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="City"><input value={form.city} onChange={set('city')} className={inputCls} /></Field>
        <Field label="Locality"><input value={form.locality} onChange={set('locality')} className={inputCls} /></Field>
        <div className="sm:col-span-2"><Field label="Address"><input value={form.address} onChange={set('address')} className={inputCls} /></Field></div>
        <Field label="Landmark"><input value={form.landmark} onChange={set('landmark')} className={inputCls} /></Field>
        <Field label="Pincode"><input value={form.pincode} onChange={set('pincode')} className={inputCls} /></Field>
        <div className="sm:col-span-2">
          <Field label="Google Maps Location" hint="Paste a Google Maps link to show it on the map">
            <input value={form.googleMapLink} onChange={set('googleMapLink')} className={inputCls} placeholder="https://maps.google.com/..." />
          </Field>
        </div>
      </div>
    </EditModal>
  )
}

export function EditProjectAmenitiesModal({ id, project, onClose, onSaved }) {
  const { save, saving, error } = useProjectSave(id, onSaved)
  const [amenities, setAmenities] = useState(project.amenities || [])
  const toggle = (a) => setAmenities((list) => (list.includes(a) ? list.filter((x) => x !== a) : [...list, a]))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await save({ amenities: JSON.stringify(amenities) })
    if (ok) onClose()
  }

  return (
    <EditModal title="Common Amenities" icon="🏊" onClose={onClose} onSubmit={handleSubmit} saving={saving} error={error} wide>
      <div className="flex flex-wrap gap-2">
        {COMMON_AMENITY_LIST.map((a) => {
          const selected = amenities.includes(a)
          return (
            <button key={a} type="button" onClick={() => toggle(a)}
              className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${
                selected ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-700'
              }`}>
              <span className="mr-1">{amenityIcon(a)}</span>{a}
            </button>
          )
        })}
      </div>
    </EditModal>
  )
}

export function EditNearbyPlacesModal({ id, project, onClose, onSaved }) {
  const { save, saving, error } = useProjectSave(id, onSaved)
  const [rows, setRows] = useState(project.nearbyLocations?.length ? project.nearbyLocations.map((r) => ({ ...r })) : [])
  const addRow = () => setRows((r) => [...r, { type: NEARBY_TYPES[0], name: '', distance: '' }])
  const updateRow = (idx, key, value) => setRows((r) => r.map((row, i) => (i === idx ? { ...row, [key]: value } : row)))
  const removeRow = (idx) => setRows((r) => r.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await save({ nearbyLocations: JSON.stringify(rows.filter((r) => r.name)) })
    if (ok) onClose()
  }

  return (
    <EditModal title="Nearby Places" icon="📌" onClose={onClose} onSubmit={handleSubmit} saving={saving} error={error} wide>
      <div className="space-y-3">
        {rows.map((row, idx) => (
          <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr,1.5fr,1fr,auto] items-center">
            <select value={row.type} onChange={(e) => updateRow(idx, 'type', e.target.value)} className={selectCls}>
              {NEARBY_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            <input value={row.name} onChange={(e) => updateRow(idx, 'name', e.target.value)} className={inputCls} placeholder="Name (e.g. DPS School)" />
            <input value={row.distance} onChange={(e) => updateRow(idx, 'distance', e.target.value)} className={inputCls} placeholder="2.5 km" />
            <button type="button" onClick={() => removeRow(idx)} className="text-xs font-medium text-red-500 hover:text-red-600">Remove</button>
          </div>
        ))}
        {rows.length === 0 && <p className="text-xs text-gray-400">No nearby locations added yet</p>}
      </div>
      <button type="button" onClick={addRow} className="text-sm font-medium text-primary-600 hover:text-primary-700">+ Add Nearby Location</button>
    </EditModal>
  )
}

export function EditContactModal({ id, project, onClose, onSaved }) {
  const { save, saving, error } = useProjectSave(id, onSaved)
  const contact = project.contact || {}
  const [form, setForm] = useState({
    salesPhone: contact.salesPhone || '', alternatePhone: contact.alternatePhone || '', whatsapp: contact.whatsapp || '',
    email: contact.email || '', website: contact.website || '',
  })
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await save({ ...form })
    if (ok) onClose()
  }

  return (
    <EditModal title="Contact Details" icon="📞" onClose={onClose} onSubmit={handleSubmit} saving={saving} error={error}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Sales Phone"><input value={form.salesPhone} onChange={set('salesPhone')} className={inputCls} /></Field>
        <Field label="Alternate Phone"><input value={form.alternatePhone} onChange={set('alternatePhone')} className={inputCls} /></Field>
        <Field label="WhatsApp"><input value={form.whatsapp} onChange={set('whatsapp')} className={inputCls} /></Field>
        <Field label="Email"><input type="email" value={form.email} onChange={set('email')} className={inputCls} /></Field>
        <div className="sm:col-span-2"><Field label="Website"><input value={form.website} onChange={set('website')} className={inputCls} /></Field></div>
      </div>
    </EditModal>
  )
}
