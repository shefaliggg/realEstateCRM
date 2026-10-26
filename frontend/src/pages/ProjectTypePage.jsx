import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'

const STATUS_COLORS = {
  'Pre-Launch': 'bg-purple-100 text-purple-700',
  'New Launch': 'bg-blue-100 text-blue-700',
  'Under Construction': 'bg-yellow-100 text-yellow-700',
  'Ready to Move': 'bg-green-100 text-green-700',
  'Completed': 'bg-gray-100 text-gray-700',
}

const TYPE_LABELS = {
  buildings: 'Buildings',
  villas: 'Villas',
  plots: 'Plots',
  commercial: 'Commercial',
  'mixed-use': 'Mixed Use',
}

const PROJECT_STATUS_OPTIONS = ['Pre-Launch', 'New Launch', 'Under Construction', 'Ready to Move', 'Completed', 'Sold Out']
const BHK_OPTIONS = ['All', '1 BHK', '2 BHK', '2.5 BHK', '3 BHK', '3.5 BHK', '4 BHK', 'Penthouse']
const RERA_STATUS_OPTIONS = ['All', 'Approved', 'Pending']

function formatPrice(p) {
  const n = Number(p)
  if (!n) return ''
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 2)} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

function CardView({ projects }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {projects.map(project => {
        const inventory = project.inventoryStats || {}
        const totalUnits = inventory.total || project.totalUnits || 0
        const soldUnits = (inventory.booked || 0) + (inventory.registered || 0)
        const soldPct = totalUnits ? Math.round((soldUnits / totalUnits) * 100) : 0
        const pulse = {
          todayLeads: project.salesPulse?.todayLeads ?? Math.max(0, Math.round((inventory.booked || 0) / 2)),
          followUpsDue: project.salesPulse?.followUpsDue ?? Math.max(0, Math.round((inventory.available || 0) / 3)),
          siteVisits: project.salesPulse?.siteVisits ?? Math.max(0, Math.round((inventory.reserved || 0) / 2)),
        }
        const priceStart = project.pricing?.priceStart || project.startingPrice || project.price
        const priceEnd = project.pricing?.priceEnd
        const priceLabel = priceStart && priceEnd
          ? `${formatPrice(priceStart)} - ${formatPrice(priceEnd)}`
          : priceStart
            ? `From ${formatPrice(priceStart)}`
            : 'Price on request'
        const possessionDate = project.possessionDate
          ? new Date(project.possessionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
          : 'TBD'
        const bhkOptions = (project.bhkTypes || []).slice(0, 4)
        const bookingOpen = project.salesInfo?.bookingOpen
        const team = project.managedBy || []
        const coverImage = project.coverImage || project.images?.[0]

        return (
          <Link
            key={project._id}
            to={`/projects/${project._id}`}
            className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden block"
          >
            <div className="relative">
              <span className={`absolute left-3 top-3 z-10 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm ${STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-600'}`}>
                {project.status}
              </span>
              {bookingOpen !== undefined && (
                <span className={`absolute right-3 top-3 z-10 text-xs font-medium px-2.5 py-1 rounded-full shadow-sm ${bookingOpen ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {bookingOpen ? 'Booking Open' : 'Booking Closed'}
                </span>
              )}
              {coverImage ? (
                <img src={coverImage} alt={project.name} className="h-40 w-full object-cover" loading="lazy" />
              ) : (
                <div className="h-40 w-full bg-gradient-to-br from-slate-100 to-slate-50 flex items-center justify-center text-gray-400 text-sm font-medium">
                  No image available
                </div>
              )}
            </div>

            <div className="p-3.5 space-y-3">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold text-gray-900 leading-tight">{project.name}</h2>
                  {project.type && <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600 shrink-0">{project.type}</span>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{project.developerName || 'Developer not set'}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  📍 {project.location?.city ? `${project.location.locality ? `${project.location.locality}, ` : ''}${project.location.city}` : 'Location pending'}
                </p>
              </div>

              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-gray-900 text-sm">{priceLabel}</p>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0 ${project.reraNo ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                  {project.reraNo ? 'RERA Registered' : 'RERA Pending'}
                </span>
              </div>

              {bhkOptions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {bhkOptions.map((bhk) => (
                    <span key={bhk} className="text-[11px] font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-700">{bhk}</span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 rounded-lg bg-primary-50 border border-primary-100 p-2.5">
                <div className="text-center">
                  <p className="text-lg font-bold text-primary-700 leading-none">{pulse.todayLeads}</p>
                  <p className="text-[10px] font-medium text-primary-600/80 uppercase tracking-wide mt-1">🎯 Leads</p>
                </div>
                <div className="text-center border-x border-primary-200/60">
                  <p className="text-lg font-bold text-primary-700 leading-none">{pulse.followUpsDue}</p>
                  <p className="text-[10px] font-medium text-primary-600/80 uppercase tracking-wide mt-1">📞 Follow-ups</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-primary-700 leading-none">{pulse.siteVisits}</p>
                  <p className="text-[10px] font-medium text-primary-600/80 uppercase tracking-wide mt-1">🚗 Visits</p>
                </div>
              </div>

              {totalUnits > 0 && (
                <div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                    <span>Inventory sold</span>
                    <span className="font-medium text-gray-700">{soldUnits}/{totalUnits} ({soldPct}%)</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full bg-primary-500" style={{ width: `${soldPct}%` }} />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
                <p className="text-xs text-gray-500">
                  {totalUnits || '—'} villas · Poss. {possessionDate}
                </p>
                {team.length > 0 && (
                  <div className="flex -space-x-1.5 shrink-0">
                    {team.slice(0, 3).map((u) => (
                      <span
                        key={u._id || u}
                        title={u.name}
                        className="h-5 w-5 rounded-full bg-primary-100 text-primary-700 text-[9px] font-bold flex items-center justify-center border border-white"
                      >
                        {(u.name || '?').slice(0, 1).toUpperCase()}
                      </span>
                    ))}
                    {team.length > 3 && (
                      <span className="h-5 w-5 rounded-full bg-gray-100 text-gray-500 text-[9px] font-bold flex items-center justify-center border border-white">
                        +{team.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

function ListView({ projects }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Project</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden md:table-cell">Developer</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Type</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden lg:table-cell">Location</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden xl:table-cell">Units</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden xl:table-cell">BHK</th>
            <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {projects.map(project => (
            <tr key={project._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Link to={`/projects/${project._id}`} className="font-medium text-gray-900 hover:text-primary-600 transition-colors">
                  {project.name}
                </Link>
              </td>
              <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{project.developerName || '—'}</td>
              <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">{project.type || '—'}</td>
              <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                {project.location?.city
                  ? `${project.location.locality ? project.location.locality + ', ' : ''}${project.location.city}`
                  : '—'}
              </td>
              <td className="px-4 py-3 text-gray-500 hidden xl:table-cell">{project.totalUnits || '—'}</td>
              <td className="px-4 py-3 text-gray-500 hidden xl:table-cell">{project.bhkTypes?.join(', ') || '—'}</td>
              <td className="px-4 py-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-600'}`}>
                  {project.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const INITIAL_VILLA_FORM = {
  name: '',
  code: '',
  developerName: '',
  status: 'Pre-Launch',
  description: '',
  country: 'India',
  state: '',
  city: '',
  locality: '',
  address: '',
  landmark: '',
  pincode: '',
  googleMapLink: '',
  reraNo: '',
  launchDate: '',
  possessionDate: '',
  totalLandArea: '',
  totalUnits: '',
  numberOfFloors: '',
  bhkTypes: ['3 BHK', '4 BHK'],
  priceStart: '',
  priceEnd: '',
  basePricePerSqft: '',
  amenities: ['Swimming pool', 'Clubhouse', 'Security'],
  bookingOpen: true,
  salesPhone: '',
  whatsapp: '',
  email: '',
  website: '',
  salesOfficeAddress: '',
  siteOfficeContact: '',
  crmNotes: '',
}

const VILLA_AMENITIES = ['Swimming pool', 'Clubhouse', 'Security', 'Landscape garden', 'Gym', 'Children play area', 'Jogging track', 'Power backup', 'CCTV', 'Parking']
const VILLA_BHK_OPTIONS = ['2 BHK', '2.5 BHK', '3 BHK', '3.5 BHK', '4 BHK', '4.5 BHK', '5 BHK', 'Villa']
const VILLA_STEPS = ['Basic', 'Location', 'Villa details', 'Sales']

function VillaAddModal({ open, onClose, onCreated }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState(INITIAL_VILLA_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setStep(0)
    setForm(INITIAL_VILLA_FORM)
    setError('')
    setSaving(false)
  }, [open])

  if (!open) return null

  const updateField = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleListItem = (field, item) => {
    setForm((prev) => {
      const current = prev[field] || []
      return {
        ...prev,
        [field]: current.includes(item) ? current.filter((value) => value !== item) : [...current, item],
      }
    })
  }

  const nextStep = () => {
    if (step === 0 && !form.name.trim()) {
      setError('Project name is required.')
      return
    }
    if (step === 1 && !form.city.trim()) {
      setError('City is required.')
      return
    }
    setError('')
    setStep((prev) => Math.min(prev + 1, VILLA_STEPS.length - 1))
  }

  const prevStep = () => {
    setError('')
    setStep((prev) => Math.max(prev - 1, 0))
  }

  const submitForm = async () => {
    setSaving(true)
    setError('')

    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        developerName: form.developerName.trim(),
        description: form.description.trim(),
        type: 'Villas',
        status: form.status,
        reraNo: form.reraNo.trim(),
        launchDate: form.launchDate || '',
        possessionDate: form.possessionDate || '',
        totalLandArea: form.totalLandArea || '',
        totalUnits: Number(form.totalUnits) || undefined,
        numberOfFloors: Number(form.numberOfFloors) || undefined,
        bhkTypes: form.bhkTypes,
        amenities: form.amenities,
        pricing: {
          priceStart: Number(form.priceStart) || undefined,
          priceEnd: Number(form.priceEnd) || undefined,
          basePricePerSqft: Number(form.basePricePerSqft) || undefined,
        },
        location: {
          country: form.country || 'India',
          state: form.state,
          city: form.city,
          locality: form.locality,
          address: form.address,
          landmark: form.landmark,
          pincode: form.pincode,
          googleMapLink: form.googleMapLink,
        },
        salesInfo: {
          bookingOpen: !!form.bookingOpen,
          salesOfficeAddress: form.salesOfficeAddress,
          siteOfficeContact: form.siteOfficeContact,
          crmNotes: form.crmNotes,
        },
        contact: {
          salesPhone: form.salesPhone,
          whatsapp: form.whatsapp,
          email: form.email,
          website: form.website,
        },
      }

      await api.post('/projects', payload)
      onCreated?.()
      onClose()
    } catch (submitError) {
      setError(submitError?.response?.data?.message || 'Failed to create villa project.')
    } finally {
      setSaving(false)
    }
  }

  const stepContent = () => {
    if (step === 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Project name</label>
            <input value={form.name} onChange={updateField('name')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Sunrise Villa Residences" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Project code</label>
            <input value={form.code} onChange={updateField('code')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="SVR-01" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Developer / Builder</label>
            <input value={form.developerName} onChange={updateField('developerName')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Green Valley Developers" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Status</label>
            <select value={form.status} onChange={updateField('status')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-700">
              {PROJECT_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">RERA number</label>
            <input value={form.reraNo} onChange={updateField('reraNo')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="P-1234/2024" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
            <textarea value={form.description} onChange={updateField('description')} rows="3" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Luxury villas with landscaped gardens and clubhouse amenities." />
          </div>
        </div>
      )
    }

    if (step === 1) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">State</label>
            <input value={form.state} onChange={updateField('state')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Maharashtra" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">City</label>
            <input value={form.city} onChange={updateField('city')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Pune" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Locality</label>
            <input value={form.locality} onChange={updateField('locality')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Baner" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Pincode</label>
            <input value={form.pincode} onChange={updateField('pincode')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="411045" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address</label>
            <input value={form.address} onChange={updateField('address')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Plot 20, near XYZ Road" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Landmark</label>
            <input value={form.landmark} onChange={updateField('landmark')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Near F.C. Road" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Google map link</label>
            <input value={form.googleMapLink} onChange={updateField('googleMapLink')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="https://maps.google.com/..." />
          </div>
        </div>
      )
    }

    if (step === 2) {
      return (
        <div className="space-y-4">
          <div className="mb-2 rounded-lg border border-primary-100 bg-primary-50 px-3 py-2 text-xs text-primary-700">
            This project contains individual villas, not towers.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total villas</label>
              <input type="number" value={form.totalUnits} onChange={updateField('totalUnits')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="32" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Total land area</label>
              <input value={form.totalLandArea} onChange={updateField('totalLandArea')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="4.5 acres" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Villa floors</label>
              <input type="number" value={form.numberOfFloors} onChange={updateField('numberOfFloors')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="2" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Launch date</label>
              <input type="date" value={form.launchDate} onChange={updateField('launchDate')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Possession date</label>
              <input type="date" value={form.possessionDate} onChange={updateField('possessionDate')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Starting price</label>
              <input type="number" value={form.priceStart} onChange={updateField('priceStart')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="8500000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Ending price</label>
              <input type="number" value={form.priceEnd} onChange={updateField('priceEnd')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="14000000" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Base price / sq.ft</label>
              <input type="number" value={form.basePricePerSqft} onChange={updateField('basePricePerSqft')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="6200" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">BHK options</label>
            <div className="flex flex-wrap gap-2">
              {VILLA_BHK_OPTIONS.map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => toggleListItem('bhkTypes', option)}
                  className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${form.bhkTypes.includes(option) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {VILLA_AMENITIES.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => toggleListItem('amenities', item)}
                  className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${form.amenities.includes(item) ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={form.bookingOpen} onChange={updateField('bookingOpen')} className="h-4 w-4 text-primary-600" />
            Booking open
          </label>
          <div></div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sales phone</label>
            <input value={form.salesPhone} onChange={updateField('salesPhone')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">WhatsApp</label>
            <input value={form.whatsapp} onChange={updateField('whatsapp')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={updateField('email')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="sales@company.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Website</label>
            <input value={form.website} onChange={updateField('website')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="https://example.com" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">Sales office address</label>
            <input value={form.salesOfficeAddress} onChange={updateField('salesOfficeAddress')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Site office, Baner, Pune" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">CRM notes</label>
            <textarea rows="3" value={form.crmNotes} onChange={updateField('crmNotes')} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="Add notes for sales / marketing team" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-200">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-primary-600 font-semibold">New villa</p>
            <h2 className="text-xl font-bold text-gray-900">Add villa project</h2>
          </div>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-gray-400 hover:text-gray-600">×</button>
        </div>

        <div className="px-6 py-4">
          <div className="mb-6 flex items-center gap-3">
            {VILLA_STEPS.map((label, index) => (
              <div key={label} className="flex items-center gap-2 flex-1 min-w-0">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${index <= step ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {index + 1}
                </div>
                <span className={`hidden sm:inline text-xs font-medium ${index <= step ? 'text-gray-800' : 'text-gray-400'}`}>{label}</span>
              </div>
            ))}
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {stepContent()}
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button type="button" onClick={prevStep} className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Back</button>
            )}
            {step < VILLA_STEPS.length - 1 ? (
              <button type="button" onClick={nextStep} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Next</button>
            ) : (
              <button type="button" onClick={submitForm} disabled={saving} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60">
                {saving ? 'Saving...' : 'Create villa'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProjectTypePage() {
  const { type } = useParams()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [view, setView] = useState('card')
  const [search, setSearch] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchInputRef = useRef(null)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [users, setUsers] = useState([])
  const [filterManagedBy, setFilterManagedBy] = useState('')
  const [filterReraStatus, setFilterReraStatus] = useState('')
  const [filterBhk, setFilterBhk] = useState('All')
  const [filterMinPrice, setFilterMinPrice] = useState('')
  const [filterMaxPrice, setFilterMaxPrice] = useState('')

  const projectType = TYPE_LABELS[type] || 'Projects'
  const isBuildingsPage = projectType === 'Buildings'
  const isVillasPage = projectType === 'Villas'
  const [isAddVillaOpen, setIsAddVillaOpen] = useState(false)

  const loadProjects = () => {
    setLoading(true)
    return Promise.all([api.get('/projects'), api.get('/users')])
      .then(([projectsRes, usersRes]) => {
        setProjects(projectsRes.data || [])
        setUsers(usersRes.data || [])
      })
      .catch(() => setError('Failed to load projects'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus()
    }
  }, [isSearchOpen])

  useEffect(() => {
    loadProjects()
  }, [])

  const cities = useMemo(() => {
    const seen = new Set()
    projects.forEach(p => { if (p.location?.city) seen.add(p.location.city) })
    return [...seen].sort()
  }, [projects])

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (p.type !== projectType) return false
      if (filterStatus && p.status !== filterStatus) return false
      if (filterCity && p.location?.city !== filterCity) return false
      if (filterManagedBy) {
        const selectedUser = users.find(user => user._id === filterManagedBy)
        const selectedName = (selectedUser?.name || '').toLowerCase()
        const selectedEmail = (selectedUser?.email || '').toLowerCase()
        const managedByMatches = (p.managedBy || []).some(entry => {
          if (typeof entry === 'string') {
            return entry === filterManagedBy || entry.toLowerCase().includes(selectedName) || entry.toLowerCase().includes(selectedEmail)
          }
          if (typeof entry === 'object') {
            const id = entry._id || ''
            const name = (entry.name || '').toLowerCase()
            const email = (entry.email || '').toLowerCase()
            return id === filterManagedBy || name.includes(selectedName) || email.includes(selectedEmail)
          }
          return false
        })
        const fallbackMatch = (p.developerName || '').toLowerCase().includes(selectedName)
        if (!managedByMatches && !fallbackMatch) return false
      }
      if (filterReraStatus) {
        const hasRera = Boolean(p.reraNo && String(p.reraNo).trim())
        if (filterReraStatus === 'Approved' ? !hasRera : hasRera) return false
      }
      if (filterBhk !== 'All') {
        const matched = (p.bhkTypes || []).some((bhk) => bhk.toLowerCase().includes(filterBhk.toLowerCase().replace(' bhk', '')))
        if (!matched) return false
      }
      if (filterMinPrice || filterMaxPrice) {
        const priceValue = Number(p.startingPrice || p.price || p.priceRange || 0)
        const minValue = Number(filterMinPrice || 0)
        const maxValue = Number(filterMaxPrice || Number.MAX_SAFE_INTEGER)
        if (!Number.isFinite(priceValue) || priceValue < minValue || priceValue > maxValue) return false
      }
      if (search) {
        const q = search.toLowerCase()
        if (
          !p.name?.toLowerCase().includes(q) &&
          !p.developerName?.toLowerCase().includes(q) &&
          !p.location?.city?.toLowerCase().includes(q) &&
          !p.location?.locality?.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [projects, projectType, filterStatus, filterCity, filterManagedBy, filterReraStatus, filterBhk, filterMinPrice, filterMaxPrice, search, users])

  const hasFilters = search || filterStatus || filterCity || filterManagedBy || filterReraStatus || filterBhk !== 'All' || filterMinPrice || filterMaxPrice

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isBuildingsPage ? 'Buildings Sales Dashboard' : `${projectType} Projects`}</h1>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} of {projects.filter(p => p.type === projectType).length} project{projects.filter(p => p.type === projectType).length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isVillasPage ? (
            <button
              type="button"
              onClick={() => setIsAddVillaOpen(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              + Add Villa
            </button>
          ) : (
            <Link to="/projects/add" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              + Add Building
            </Link>
          )}
        </div>
      </div>

      {isVillasPage && (
        <VillaAddModal
          open={isAddVillaOpen}
          onClose={() => setIsAddVillaOpen(false)}
          onCreated={() => {
            setIsAddVillaOpen(false)
            loadProjects()
          }}
        />
      )}

      <div className="flex flex-nowrap items-center gap-2 mb-6 overflow-x-auto pb-1">
        <div className="relative flex-shrink-0">
          {!isSearchOpen ? (
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              aria-label="Open search"
            >
              🔍
            </button>
          ) : (
            <div className="relative w-48">
              <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={isBuildingsPage ? 'Project name' : 'Search projects...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onBlur={() => {
                  if (!search.trim()) {
                    setIsSearchOpen(false)
                  }
                }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 min-w-[120px]"
        >
          <option value="">Project status</option>
          {PROJECT_STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
        </select>

        {isBuildingsPage && (
          <select
            value={filterManagedBy}
            onChange={e => setFilterManagedBy(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 min-w-[120px]"
          >
            <option value="">Managed by</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.name || user.email || 'Unnamed user'}</option>
            ))}
          </select>
        )}

        {cities.length > 0 && (
          <select
            value={filterCity}
            onChange={e => setFilterCity(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 min-w-[120px]"
          >
            <option value="">City / zone</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {isBuildingsPage && (
          <>
            <select
              value={filterReraStatus}
              onChange={e => setFilterReraStatus(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 min-w-[120px]"
            >
              <option value="">RERA status</option>
              {RERA_STATUS_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>

            <select
              value={filterBhk}
              onChange={e => setFilterBhk(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-gray-700 min-w-[120px]"
            >
              {BHK_OPTIONS.map(option => <option key={option} value={option}>{option === 'All' ? 'All BHK' : option}</option>)}
            </select>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="number"
                placeholder="Min price"
                value={filterMinPrice}
                onChange={e => setFilterMinPrice(e.target.value)}
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
              <span>–</span>
              <input
                type="number"
                placeholder="Max price"
                value={filterMaxPrice}
                onChange={e => setFilterMaxPrice(e.target.value)}
                className="w-24 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
            </div>
          </>
        )}

        {hasFilters && (
          <button
            onClick={() => {
              setSearch('')
              setFilterStatus('')
              setFilterCity('')
              setFilterManagedBy('')
              setFilterReraStatus('')
              setFilterBhk('All')
              setFilterMinPrice('')
              setFilterMaxPrice('')
            }}
            className="text-sm text-gray-500 hover:text-gray-800 underline"
          >
            Clear filters
          </button>
        )}

        <div className="ml-auto flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setView('card')}
            title="Card view"
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${view === 'card' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ⊞ Cards
          </button>
          <button
            onClick={() => setView('list')}
            title="List view"
            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${view === 'list' ? 'bg-white shadow text-gray-900 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          >
            ☰ List
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-16 text-gray-400">Loading projects...</div>}
      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-4">{error}</div>}

      {!loading && !error && filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-gray-500 text-lg mb-1">No {projectType.toLowerCase()} projects match your filters</p>
          <button
            onClick={() => {
              setSearch('')
              setFilterStatus('')
              setFilterCity('')
              setFilterManagedBy('')
              setFilterReraStatus('')
              setFilterBhk('All')
              setFilterMinPrice('')
              setFilterMaxPrice('')
            }}
            className="text-primary-600 hover:underline text-sm"
          >
            Clear filters
          </button>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        view === 'card' ? <CardView projects={filtered} /> : <ListView projects={filtered} />
      )}
    </div>
  )
}
