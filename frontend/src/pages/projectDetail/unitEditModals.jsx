import { useState } from 'react'
import { EditModal, Field, inputCls, selectCls, useEntitySave, buildFormData, SingleFileField } from './editShared'

const FACING = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West']
const BHK_TYPES = ['Studio', '1 BHK', '1.5 BHK', '2 BHK', '2.5 BHK', '3 BHK', '3.5 BHK', '4 BHK', '4.5 BHK', '5 BHK', 'Duplex', 'Penthouse']
const STATUS_OPTIONS = ['Available', 'Reserved', 'Booked', 'Registered', 'Cancelled']

const PRICE_KEYS = ['basePrice', 'plc', 'floorRise', 'parkingCharges', 'clubCharges', 'otherCharges']

export function EditUnitModal({ projectId, unit, bhkTypeOptions, onClose, onSaved }) {
  const { save, saving, error } = useEntitySave(`/projects/${projectId}/units/${unit._id}`, onSaved)
  const [form, setForm] = useState({
    floor: unit.floor ?? '', unitNo: unit.unitNo || '',
    bhkType: unit.bhkType || '2 BHK', facing: unit.facing || '', cornerUnit: !!unit.cornerUnit,
    carpetArea: unit.carpetArea ?? '', builtUpArea: unit.builtUpArea ?? '', superBuiltUpArea: unit.superBuiltUpArea ?? '', balconyArea: unit.balconyArea ?? '',
    basePrice: unit.basePrice ?? '', pricePerSqft: unit.pricePerSqft ?? '', plc: unit.plc ?? '', floorRise: unit.floorRise ?? '',
    parkingCharges: unit.parkingCharges ?? '', clubCharges: unit.clubCharges ?? '', otherCharges: unit.otherCharges ?? '',
    parkingIncluded: !!unit.parkingIncluded, parkingNumber: unit.parkingNumber || '',
    possessionStatus: unit.possessionStatus || 'Under Construction', status: unit.status || 'Available',
  })
  const [floorPlanFile, setFloorPlanFile] = useState(null)
  const [priceSheetFile, setPriceSheetFile] = useState(null)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const totalPricePreview = PRICE_KEYS.some((k) => form[k])
    ? PRICE_KEYS.reduce((sum, k) => sum + (Number(form[k]) || 0), 0)
    : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fields = {
      floor: form.floor, unitNo: form.unitNo, bhkType: form.bhkType, facing: form.facing, cornerUnit: String(form.cornerUnit),
      carpetArea: form.carpetArea, builtUpArea: form.builtUpArea, superBuiltUpArea: form.superBuiltUpArea, balconyArea: form.balconyArea,
      basePrice: form.basePrice, pricePerSqft: form.pricePerSqft, plc: form.plc, floorRise: form.floorRise,
      parkingCharges: form.parkingCharges, clubCharges: form.clubCharges, otherCharges: form.otherCharges,
      parkingIncluded: String(form.parkingIncluded), parkingNumber: form.parkingNumber,
      possessionStatus: form.possessionStatus, status: form.status,
    }
    const hasFiles = floorPlanFile || priceSheetFile
    const payload = hasFiles ? buildFormData(fields, { floorPlan: floorPlanFile, priceSheet: priceSheetFile }) : fields
    const ok = await save(payload, { multipart: !!hasFiles })
    if (ok) onClose()
  }

  return (
    <EditModal title={`Flat ${unit.unitNo}`} icon="🏠" onClose={onClose} onSubmit={handleSubmit} saving={saving} error={error} wide submitLabel="Save Flat">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Floor"><input type="number" value={form.floor} onChange={set('floor')} className={inputCls} /></Field>
        <Field label="Flat Number"><input value={form.unitNo} onChange={set('unitNo')} className={inputCls} /></Field>
        <Field label="Unit Type">
          <select value={form.bhkType} onChange={set('bhkType')} className={selectCls}>
            {(bhkTypeOptions?.length ? bhkTypeOptions : BHK_TYPES).map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
        <Field label="Facing">
          <select value={form.facing} onChange={set('facing')} className={selectCls}>
            <option value="">Select facing...</option>
            {FACING.map((f) => <option key={f}>{f}</option>)}
          </select>
        </Field>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.cornerUnit} onChange={(e) => setForm((f) => ({ ...f, cornerUnit: e.target.checked }))} className="w-4 h-4 accent-primary-600" />
        <span className="text-sm text-gray-600">This is a corner unit</span>
      </label>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Carpet Area (sqft)"><input type="number" value={form.carpetArea} onChange={set('carpetArea')} className={inputCls} /></Field>
        <Field label="Built-up Area (sqft)"><input type="number" value={form.builtUpArea} onChange={set('builtUpArea')} className={inputCls} /></Field>
        <Field label="Super Built-up (sqft)"><input type="number" value={form.superBuiltUpArea} onChange={set('superBuiltUpArea')} className={inputCls} /></Field>
        <Field label="Balcony Area (sqft)"><input type="number" value={form.balconyArea} onChange={set('balconyArea')} className={inputCls} /></Field>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Base Price (₹)"><input type="number" value={form.basePrice} onChange={set('basePrice')} className={inputCls} /></Field>
        <Field label="Price / Sq.ft (₹)"><input type="number" value={form.pricePerSqft} onChange={set('pricePerSqft')} className={inputCls} /></Field>
        <Field label="PLC (₹)"><input type="number" value={form.plc} onChange={set('plc')} className={inputCls} /></Field>
        <Field label="Floor Rise (₹)"><input type="number" value={form.floorRise} onChange={set('floorRise')} className={inputCls} /></Field>
        <Field label="Parking Charges (₹)"><input type="number" value={form.parkingCharges} onChange={set('parkingCharges')} className={inputCls} /></Field>
        <Field label="Club Charges (₹)"><input type="number" value={form.clubCharges} onChange={set('clubCharges')} className={inputCls} /></Field>
        <Field label="Other Charges (₹)"><input type="number" value={form.otherCharges} onChange={set('otherCharges')} className={inputCls} /></Field>
      </div>
      {totalPricePreview !== null && (
        <div className="rounded-lg bg-primary-50 border border-primary-100 px-3 py-2 flex items-center justify-between">
          <span className="text-sm text-primary-700 font-medium">Total Price</span>
          <span className="text-sm font-bold text-primary-800">₹{totalPricePreview.toLocaleString('en-IN')}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.parkingIncluded} onChange={(e) => setForm((f) => ({ ...f, parkingIncluded: e.target.checked }))} className="w-4 h-4 accent-primary-600" />
          <span className="text-sm text-gray-600">Parking included with this unit</span>
        </label>
        <Field label="Parking Number"><input value={form.parkingNumber} onChange={set('parkingNumber')} className={inputCls} placeholder="P-104" /></Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Sales Status">
          <select value={form.status} onChange={set('status')} className={selectCls}>
            {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Possession">
          <select value={form.possessionStatus} onChange={set('possessionStatus')} className={selectCls}>
            <option>Under Construction</option>
            <option>Ready</option>
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SingleFileField label="Floor Plan" currentUrl={unit.documents?.floorPlan} file={floorPlanFile} onPick={setFloorPlanFile} accept="image/*,application/pdf" previewAs="file" />
        <SingleFileField label="Price Sheet" currentUrl={unit.documents?.priceSheet} file={priceSheetFile} onPick={setPriceSheetFile} accept="image/*,application/pdf" previewAs="file" />
      </div>
    </EditModal>
  )
}
