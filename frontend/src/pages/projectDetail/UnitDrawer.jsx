import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { Drawer } from './editShared'
import { EditUnitModal } from './unitEditModals'
import AddPlotModal from './AddPlotModal'
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

const DOCUMENT_ROWS = [
  ['floorPlan', 'Floor Plan'],
  ['priceSheet', 'Price Sheet'],
]

const isImageUrl = (url) => /\.(png|jpe?g|gif|webp|svg)$/i.test(url || '')

export default function UnitDrawer({ unit, projectId, bhkTypeOptions, isVillaProject = false, isPlotProject = false, isCommercialProject = false, isMixedUseProject = false, onClose, onChanged }) {
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

  if (editing && isPlotProject) {
    return (
      <AddPlotModal
        projectId={projectId}
        unit={unit}
        onClose={() => setEditing(false)}
        onCreated={() => { setEditing(false); onChanged?.(); onClose() }}
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
      title={isPlotProject ? `Plot ${unit.unitNo}` : isVillaProject ? `Villa ${unit.unitNo}` : isCommercialProject && !isMixedUseProject ? `Unit ${unit.unitNo}` : `Tower ${unit.block} – ${unit.unitNo}`}
      icon={isPlotProject ? '📍' : isCommercialProject ? '🏬' : '🏠'}
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
            {isPlotProject && <>
              <div><dt className="text-gray-500">Phase / Sector</dt><dd className="font-medium mt-0.5">{unit.block && unit.block !== 'PLOT' ? unit.block : '—'}</dd></div>
              <div><dt className="text-gray-500">Usage</dt><dd className="font-medium mt-0.5">{unit.plotUsage || '—'}</dd></div>
              <div><dt className="text-gray-500">Dimensions</dt><dd className="font-medium mt-0.5">{unit.plotLength && unit.plotWidth ? `${unit.plotLength} × ${unit.plotWidth} ft` : '—'}</dd></div>
              <div><dt className="text-gray-500">Plot Area</dt><dd className="font-medium mt-0.5">{unit.plotArea ? `${unit.plotArea} sqft` : '—'}</dd></div>
              <div><dt className="text-gray-500">Facing</dt><dd className="font-medium mt-0.5">{unit.facing || '—'}</dd></div>
              <div><dt className="text-gray-500">Road Width</dt><dd className="font-medium mt-0.5">{unit.roadWidth ? `${unit.roadWidth} ft` : '—'}</dd></div>
              <div><dt className="text-gray-500">Corner Plot</dt><dd className="font-medium mt-0.5">{unit.cornerUnit ? 'Yes' : 'No'}</dd></div>
              <div><dt className="text-gray-500">Possession</dt><dd className="font-medium mt-0.5">{unit.possessionStatus || '—'}</dd></div>
            </>}
            {!isPlotProject && <>
            {!isVillaProject && (!isCommercialProject || isMixedUseProject) && <div><dt className="text-gray-500">Tower</dt><dd className="font-medium mt-0.5">{unit.block}</dd></div>}
            {!isVillaProject && <div><dt className="text-gray-500">Floor</dt><dd className="font-medium mt-0.5">{isCommercialProject && Number(unit.floor) === 0 ? 'Ground' : unit.floor}</dd></div>}
            {isVillaProject && <div><dt className="text-gray-500">Villa Style</dt><dd className="font-medium mt-0.5">{unit.villaStyle || '—'}</dd></div>}
            {isMixedUseProject && <div><dt className="text-gray-500">Category</dt><dd className="font-medium mt-0.5">{isCommercialProject ? 'Commercial' : 'Residential'}</dd></div>}
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
            {isCommercialProject && <>
              <div><dt className="text-gray-500">Super Built-up</dt><dd className="font-medium mt-0.5">{unit.superBuiltUpArea ? `${unit.superBuiltUpArea} sqft` : '—'}</dd></div>
              <div><dt className="text-gray-500">Frontage</dt><dd className="font-medium mt-0.5">{unit.frontage ? `${unit.frontage} ft` : '—'}</dd></div>
              <div><dt className="text-gray-500">Ceiling Height</dt><dd className="font-medium mt-0.5">{unit.ceilingHeight ? `${unit.ceilingHeight} ft` : '—'}</dd></div>
              <div><dt className="text-gray-500">Power Load</dt><dd className="font-medium mt-0.5">{unit.powerLoad ? `${unit.powerLoad} kVA` : '—'}</dd></div>
              <div><dt className="text-gray-500">Washrooms</dt><dd className="font-medium mt-0.5">{unit.bathrooms ?? '—'}</dd></div>
              <div><dt className="text-gray-500">Parking Spaces</dt><dd className="font-medium mt-0.5">{unit.parkingSpaces ?? '—'}</dd></div>
              <div><dt className="text-gray-500">Furnishing</dt><dd className="font-medium mt-0.5">{unit.furnishingStatus || '—'}</dd></div>
              <div><dt className="text-gray-500">Pantry</dt><dd className="font-medium mt-0.5">{unit.pantry ? 'Yes' : 'No'}</dd></div>
              <div><dt className="text-gray-500">Corner Unit</dt><dd className="font-medium mt-0.5">{unit.cornerUnit ? 'Yes' : 'No'}</dd></div>
              <div><dt className="text-gray-500">Possession</dt><dd className="font-medium mt-0.5">{unit.possessionStatus || '—'}</dd></div>
            </>}
            </>}
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
            {unit.maintenancePerSqft ? (
              <div className="flex items-center justify-between">
                <dt className="text-gray-500">Maintenance</dt>
                <dd className="font-medium">₹{unit.maintenancePerSqft}/sqft/month</dd>
              </div>
            ) : null}
          </dl>
        </div>

        {DOCUMENT_ROWS.some(([key]) => unit.documents?.[key]) && (
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Documents</h3>
            <div className="space-y-3">
              {DOCUMENT_ROWS.map(([key, label]) => {
                const url = unit.documents?.[key]
                if (!url) return null
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{label}</span>
                      <a href={url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline font-medium">Open ↗</a>
                    </div>
                    {isImageUrl(url) && (
                      <a href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt={label} className="mt-2 w-full max-h-56 object-contain rounded-lg border border-slate-200 bg-white" loading="lazy" />
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

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
