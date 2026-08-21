import { useState } from 'react'
import { EditModal, Field, inputCls, SpecSelectField, useEntitySave } from './editShared'
import { amenityIcon } from './shared'
import {
  TOWER_AMENITY_LIST, STRUCTURE_OPTIONS, FLOORING_OPTIONS, KITCHEN_OPTIONS, BATHROOM_OPTIONS,
  DOORS_OPTIONS, WINDOWS_OPTIONS, ELECTRICAL_OPTIONS, PLUMBING_OPTIONS, PAINT_OPTIONS,
} from './projectFieldOptions'

export function EditTowerAmenitiesModal({ towerId, tower, onClose, onSaved }) {
  const { save, saving, error } = useEntitySave(`/towers/${towerId}`, onSaved)
  const [amenities, setAmenities] = useState(tower.amenities || [])
  const toggle = (a) => setAmenities((list) => (list.includes(a) ? list.filter((x) => x !== a) : [...list, a]))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await save({ amenities: JSON.stringify(amenities) })
    if (ok) onClose()
  }

  return (
    <EditModal title={`Tower ${tower.name} · Amenities`} icon="🏊" onClose={onClose} onSubmit={handleSubmit} saving={saving} error={error} wide>
      <div className="flex flex-wrap gap-2">
        {TOWER_AMENITY_LIST.map((a) => {
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

export function EditTowerSpecificationsModal({ towerId, tower, onClose, onSaved }) {
  const { save, saving, error } = useEntitySave(`/towers/${towerId}`, onSaved)
  const specs = tower.specifications || {}
  const [form, setForm] = useState({
    structure: specs.structure || '', flooring: specs.flooring || '', kitchen: specs.kitchen || '', bathroom: specs.bathroom || '',
    doors: specs.doors || '', windows: specs.windows || '', electrical: specs.electrical || '', plumbing: specs.plumbing || '', paint: specs.paint || '',
  })
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const ok = await save({ ...form })
    if (ok) onClose()
  }

  return (
    <EditModal title={`Tower ${tower.name} · Specifications`} icon="🧱" onClose={onClose} onSubmit={handleSubmit} saving={saving} error={error} wide>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SpecSelectField label="Structure" value={form.structure} onChange={set('structure')} options={STRUCTURE_OPTIONS} />
        <SpecSelectField label="Flooring" value={form.flooring} onChange={set('flooring')} options={FLOORING_OPTIONS} />
        <SpecSelectField label="Kitchen" value={form.kitchen} onChange={set('kitchen')} options={KITCHEN_OPTIONS} />
        <SpecSelectField label="Bathroom" value={form.bathroom} onChange={set('bathroom')} options={BATHROOM_OPTIONS} />
        <SpecSelectField label="Doors" value={form.doors} onChange={set('doors')} options={DOORS_OPTIONS} />
        <SpecSelectField label="Windows" value={form.windows} onChange={set('windows')} options={WINDOWS_OPTIONS} />
        <SpecSelectField label="Electrical" value={form.electrical} onChange={set('electrical')} options={ELECTRICAL_OPTIONS} />
        <SpecSelectField label="Plumbing" value={form.plumbing} onChange={set('plumbing')} options={PLUMBING_OPTIONS} />
        <SpecSelectField label="Paint" value={form.paint} onChange={set('paint')} options={PAINT_OPTIONS} />
      </div>
    </EditModal>
  )
}
