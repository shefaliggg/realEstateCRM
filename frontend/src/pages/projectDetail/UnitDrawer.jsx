import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { Drawer } from './editShared'
import { EditUnitModal } from './unitEditModals'
import UnitCustomerModal from './UnitCustomerModal'
import { formatPrice, formatDate } from './shared'

const STATUS_COLORS = {
  Available: 'bg-green-100 text-green-700',
  Reserved: 'bg-yellow-100 text-yellow-700',
  Booked: 'bg-orange-100 text-orange-700',
  Registered: 'bg-blue-100 text-blue-700',
  Cancelled: 'bg-red-100 text-red-500',
}

const PRICE_ROWS = [
  ['basePrice', 'Base Price'],
  ['floorRise', 'Floor Rise'],
  ['plc', 'PLC'],
  ['parkingCharges', 'Parking'],
  ['clubCharges', 'Club Charges'],
  ['otherCharges', 'Other Charges'],
]

export default function UnitDrawer({ unit, projectId, bhkTypeOptions, isVillaProject = false, onClose, onChanged }) {
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)

  const [askCustomer, setAskCustomer] = useState(false)

  const setStatus = async (status, extra = {}) => {
    if (busy || unit.status === status) return
    setBusy(true)
    try {
      await api.put(`/projects/${projectId}/units/${unit._id}`, { status, ...extra })
      onChanged?.()
      onClose()
    } finally {
      setBusy(false)
    }
  }

  if (askCustomer) {
    return (
      <UnitCustomerModal
        projectId={projectId}
        unit={unit}
        status="Reserved"
        onClose={() => setAskCustomer(false)}
        onConfirm={(fields) => setStatus('Reserved', fields)}
      />
    )
  }

  if (editing) {
    return (
      <EditUnitModal
        projectId={projectId}
        unit={unit}
        bhkTypeOptions={bhkTypeOptions}
        isVillaProject={isVillaProject}
        onClose={() => setEditing(false)}
        onSaved={() => { setEditing(false); onChanged?.(); onClose() }}
      />
    )
  }

  return (
    <Drawer
      title={isVillaProject ? `Villa ${unit.unitNo}` : `Tower ${unit.block} – ${unit.unitNo}`}
      icon="🏠"
      onClose={onClose}
      footer={(
        <>
          <button type="button" onClick={() => setEditing(true)} className="flex-1 text-sm font-medium px-3 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700">
            Edit
          </button>
          <button type="button" disabled={busy || unit.status === 'Reserved'} onClick={() => setAskCustomer(true)} className="flex-1 text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Reserve
          </button>
          <button type="button" disabled={busy || unit.status === 'Cancelled'} onClick={() => setStatus('Cancelled')} className="flex-1 text-sm font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Block
          </button>
        </>
      )}
    >
      <div className="space-y-4">
        <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[unit.status] || 'bg-gray-100'}`}>{unit.status}</span>

        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Basic Information</h3>
          <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            {!isVillaProject && <div><dt className="text-gray-500">Tower</dt><dd className="font-medium mt-0.5">{unit.block}</dd></div>}
            {!isVillaProject && <div><dt className="text-gray-500">Floor</dt><dd className="font-medium mt-0.5">{unit.floor}</dd></div>}
            {isVillaProject && <div><dt className="text-gray-500">Villa Style</dt><dd className="font-medium mt-0.5">{unit.villaStyle || '—'}</dd></div>}
            <div><dt className="text-gray-500">{isVillaProject ? 'Villa Type' : 'Type'}</dt><dd className="font-medium mt-0.5">{unit.bhkType}</dd></div>
            <div><dt className="text-gray-500">Facing</dt><dd className="font-medium mt-0.5">{unit.facing || '—'}</dd></div>
            {isVillaProject && <>
              <div><dt className="text-gray-500">Bathrooms</dt><dd className="font-medium mt-0.5">{unit.bathrooms || '—'}</dd></div>
              <div><dt className="text-gray-500">Villa Floors</dt><dd className="font-medium mt-0.5">{unit.villaFloors || '—'}</dd></div>
              <div><dt className="text-gray-500">Plot Area</dt><dd className="font-medium mt-0.5">{unit.plotArea ? `${unit.plotArea} sqft` : '—'}</dd></div>
              <div><dt className="text-gray-500">Garden Area</dt><dd className="font-medium mt-0.5">{unit.gardenArea ? `${unit.gardenArea} sqft` : '—'}</dd></div>
              <div><dt className="text-gray-500">Terrace Area</dt><dd className="font-medium mt-0.5">{unit.terraceArea ? `${unit.terraceArea} sqft` : '—'}</dd></div>
              <div><dt className="text-gray-500">Parking Spaces</dt><dd className="font-medium mt-0.5">{unit.parkingSpaces ?? '—'}</dd></div>
              <div><dt className="text-gray-500">Private Garden</dt><dd className="font-medium mt-0.5">{unit.privateGarden ? 'Yes' : 'No'}</dd></div>
            </>}
            <div><dt className="text-gray-500">{isVillaProject ? 'Interior Area' : 'Carpet Area'}</dt><dd className="font-medium mt-0.5">{unit.carpetArea ? `${unit.carpetArea} sqft` : '—'}</dd></div>
            <div><dt className="text-gray-500">Built-up Area</dt><dd className="font-medium mt-0.5">{unit.builtUpArea ? `${unit.builtUpArea} sqft` : '—'}</dd></div>
          </dl>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Pricing</h3>
          <dl className="space-y-2 text-sm">
            {PRICE_ROWS.map(([key, label]) => unit[key] ? (
              <div key={key} className="flex items-center justify-between">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-medium">{formatPrice(unit[key])}</dd>
              </div>
            ) : null)}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <dt className="font-semibold text-gray-700">Total</dt>
              <dd className="font-bold text-primary-700">{formatPrice(unit.totalPrice || unit.basePrice)}</dd>
            </div>
          </dl>
        </div>

        {unit.currentCustomer?.name && (
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Customer</h3>
            <p className="text-sm font-medium text-gray-900">{unit.currentCustomer.name}</p>
            <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mt-2">
              <div>
                <dt className="text-gray-500">Phone</dt>
                <dd className="font-medium mt-0.5">
                  {unit.currentCustomer.phone
                    ? <a href={`tel:${unit.currentCustomer.phone}`} className="text-primary-600 hover:underline">{unit.currentCustomer.phone}</a>
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Email</dt>
                <dd className="font-medium mt-0.5 break-all">{unit.currentCustomer.email || '—'}</dd>
              </div>
            </dl>
          </div>
        )}

        {unit.currentLead && (
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Linked Lead</h3>
            <Link to={`/leads/${unit.currentLead._id || unit.currentLead}`} className="text-primary-600 hover:underline text-sm">
              {unit.currentLead.name || 'View Lead →'}
            </Link>
          </div>
        )}

        {unit.currentDeal && (
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Linked Deal</h3>
            <Link to={`/deals/${unit.currentDeal._id || unit.currentDeal}`} className="text-primary-600 hover:underline text-sm">
              {unit.currentDeal.dealName || 'View Deal →'}
            </Link>
          </div>
        )}

        {unit.statusHistory?.length > 0 && (
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Status History</h3>
            <div className="space-y-2">
              {unit.statusHistory.map((h, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[h.status] || 'bg-gray-100'}`}>{h.status}</span>
                  <span className="text-gray-400">{formatDate(h.changedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  )
}
