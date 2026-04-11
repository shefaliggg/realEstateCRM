import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const PROPERTY_TYPES = ['Apartment', 'Villa', 'Plot', 'Commercial', 'Studio', 'Penthouse', 'Row House']
const STATUSES = ['Available', 'Booked', 'Sold', 'Under Construction']
const FURNISHINGS = ['Unfurnished', 'Semi-Furnished', 'Fully Furnished']
const FACING = ['East', 'West', 'North', 'South', 'North-East', 'North-West', 'South-East', 'South-West']

const EMPTY = {
  title: '', type: 'Apartment', status: 'Available',
  project: '', builder: '',
  address: '', locality: '', city: '', state: '', pincode: '',
  price: '', pricePerSqft: '', isNegotiable: false,
  area: '', bedrooms: '', bathrooms: '', balconies: '', floor: '', totalFloors: '',
  furnishing: 'Unfurnished', facing: '',
  parkingType: '', parkingCount: '',
  possessionDate: '', ageOfProperty: '',
  description: '', highlights: '',
  amenities: [],
}

const AMENITY_LIST = [
  'Swimming Pool', 'Gymnasium', 'Clubhouse', 'Children Play Area', 'Jogging Track',
  'Security / CCTV', 'Power Backup', 'Lift', 'Garden / Landscape', 'Indoor Games',
  'Multipurpose Hall', 'Basketball Court', 'Tennis Court', 'Yoga Room', 'Visitor Parking',
]

function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder:text-gray-300'
const selectCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-700'

export default function AddPropertyPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  function set(key, val) {
    setForm((f) => ({ ...f, [key]: val }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function toggleAmenity(a) {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a)
        ? f.amenities.filter((x) => x !== a)
        : [...f.amenities, a],
    }))
  }

  function validate() {
    const e = {}
    if (!form.title.trim()) e.title = 'Required'
    if (!form.price) e.price = 'Required'
    if (!form.area) e.area = 'Required'
    if (!form.city.trim()) e.city = 'Required'
    if (!form.locality.trim()) e.locality = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    // TODO: wire to API POST /api/properties
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    navigate('/properties')
  }

  const section = (title, icon) => (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-6 h-6 rounded-md bg-primary-100 text-primary-600 flex items-center justify-center shrink-0 text-sm">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-gray-800">{title}</h3>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          to="/properties"
          className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <nav className="text-xs text-gray-400 mb-0.5">
            <Link to="/properties" className="hover:text-primary-600">Properties</Link>
            <span className="mx-1">/</span>
            <span className="text-gray-700">Add Property</span>
          </nav>
          <h2 className="text-xl font-bold text-gray-900">Add New Property</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">

          {/* ─── Basic Info ─── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            {section('Basic Information', '🏠')}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Field label="Property Title" required>
                  <input
                    value={form.title}
                    onChange={(e) => set('title', e.target.value)}
                    placeholder="e.g. Skyline Residency – 3BHK Apartment"
                    className={`${inputCls} ${errors.title ? 'border-red-400 focus:ring-red-400' : ''}`}
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </Field>
              </div>
              <Field label="Property Type" required>
                <select value={form.type} onChange={(e) => set('type', e.target.value)} className={selectCls}>
                  {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Status" required>
                <select value={form.status} onChange={(e) => set('status', e.target.value)} className={selectCls}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Project / Society Name">
                <input value={form.project} onChange={(e) => set('project', e.target.value)} placeholder="e.g. Skyline Heights" className={inputCls} />
              </Field>
              <Field label="Builder / Developer">
                <input value={form.builder} onChange={(e) => set('builder', e.target.value)} placeholder="e.g. Godrej Properties" className={inputCls} />
              </Field>
            </div>
          </div>

          {/* ─── Location ─── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            {section('Location', '📍')}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <Field label="Address / Street">
                  <input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Street address or landmark" className={inputCls} />
                </Field>
              </div>
              <Field label="Locality / Area" required>
                <input
                  value={form.locality}
                  onChange={(e) => set('locality', e.target.value)}
                  placeholder="e.g. Andheri West"
                  className={`${inputCls} ${errors.locality ? 'border-red-400' : ''}`}
                />
                {errors.locality && <p className="text-xs text-red-500 mt-1">{errors.locality}</p>}
              </Field>
              <Field label="City" required>
                <input
                  value={form.city}
                  onChange={(e) => set('city', e.target.value)}
                  placeholder="e.g. Mumbai"
                  className={`${inputCls} ${errors.city ? 'border-red-400' : ''}`}
                />
                {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
              </Field>
              <Field label="State">
                <input value={form.state} onChange={(e) => set('state', e.target.value)} placeholder="e.g. Maharashtra" className={inputCls} />
              </Field>
              <Field label="PIN Code">
                <input value={form.pincode} onChange={(e) => set('pincode', e.target.value)} placeholder="400001" maxLength={6} className={inputCls} />
              </Field>
            </div>
          </div>

          {/* ─── Pricing ─── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            {section('Pricing', '💰')}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <Field label="Total Price (₹)" required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => set('price', e.target.value)}
                    placeholder="0"
                    className={`${inputCls} pl-7 ${errors.price ? 'border-red-400' : ''}`}
                  />
                </div>
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                {form.price && (
                  <p className="text-[11px] text-primary-600 mt-1 font-medium">{formatPrice(Number(form.price))}</p>
                )}
              </Field>
              <Field label="Price per sq ft (₹)" hint="Auto-calculated if area is set">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                  <input
                    type="number"
                    value={form.pricePerSqft || (form.price && form.area ? Math.round(Number(form.price) / Number(form.area)) : '')}
                    onChange={(e) => set('pricePerSqft', e.target.value)}
                    placeholder="Auto"
                    className={`${inputCls} pl-7`}
                  />
                </div>
              </Field>
              <Field label="Negotiable">
                <div className="flex items-center gap-3 h-[42px]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isNegotiable}
                      onChange={(e) => set('isNegotiable', e.target.checked)}
                      className="w-4 h-4 accent-primary-600"
                    />
                    <span className="text-sm text-gray-600">Price is negotiable</span>
                  </label>
                </div>
              </Field>
            </div>
          </div>

          {/* ─── Property Details ─── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            {section('Property Details', '📐')}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <Field label="Carpet Area (sq ft)" required>
                <input
                  type="number"
                  value={form.area}
                  onChange={(e) => set('area', e.target.value)}
                  placeholder="0"
                  className={`${inputCls} ${errors.area ? 'border-red-400' : ''}`}
                />
                {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area}</p>}
              </Field>
              <Field label="Bedrooms">
                <select value={form.bedrooms} onChange={(e) => set('bedrooms', e.target.value)} className={selectCls}>
                  <option value="">—</option>
                  {['Studio', 1, 2, 3, 4, 5, '6+'].map((n) => <option key={n}>{n}</option>)}
                </select>
              </Field>
              <Field label="Bathrooms">
                <select value={form.bathrooms} onChange={(e) => set('bathrooms', e.target.value)} className={selectCls}>
                  <option value="">—</option>
                  {[1, 2, 3, 4, 5, '6+'].map((n) => <option key={n}>{n}</option>)}
                </select>
              </Field>
              <Field label="Balconies">
                <select value={form.balconies} onChange={(e) => set('balconies', e.target.value)} className={selectCls}>
                  <option value="">—</option>
                  {[0, 1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}
                </select>
              </Field>
              <Field label="Floor No.">
                <input value={form.floor} onChange={(e) => set('floor', e.target.value)} placeholder="e.g. 12" className={inputCls} />
              </Field>
              <Field label="Total Floors">
                <input value={form.totalFloors} onChange={(e) => set('totalFloors', e.target.value)} placeholder="e.g. 32" className={inputCls} />
              </Field>
              <Field label="Furnishing">
                <select value={form.furnishing} onChange={(e) => set('furnishing', e.target.value)} className={selectCls}>
                  {FURNISHINGS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Facing">
                <select value={form.facing} onChange={(e) => set('facing', e.target.value)} className={selectCls}>
                  <option value="">—</option>
                  {FACING.map((f) => <option key={f}>{f}</option>)}
                </select>
              </Field>
              <Field label="Parking Type">
                <select value={form.parkingType} onChange={(e) => set('parkingType', e.target.value)} className={selectCls}>
                  <option value="">None</option>
                  <option>Open</option>
                  <option>Covered</option>
                  <option>Stilt</option>
                </select>
              </Field>
              <Field label="Parking Slots">
                <input type="number" value={form.parkingCount} onChange={(e) => set('parkingCount', e.target.value)} placeholder="0" className={inputCls} />
              </Field>
              <Field label="Possession Date">
                <input type="date" value={form.possessionDate} onChange={(e) => set('possessionDate', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Age of Property">
                <input value={form.ageOfProperty} onChange={(e) => set('ageOfProperty', e.target.value)} placeholder="e.g. 2 years / New" className={inputCls} />
              </Field>
            </div>
          </div>

          {/* ─── Amenities ─── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            {section('Amenities', '✨')}
            <div className="flex flex-wrap gap-2">
              {AMENITY_LIST.map((a) => {
                const selected = form.amenities.includes(a)
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${
                      selected
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-primary-700'
                    }`}
                  >
                    {selected && <span className="mr-1">✓</span>}
                    {a}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ─── Description ─── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            {section('Description & Highlights', '📝')}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Description">
                <textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Describe the property — location advantages, interiors, nearby landmarks…"
                  rows={5}
                  className={inputCls}
                />
              </Field>
              <Field label="Key Highlights" hint="One highlight per line">
                <textarea
                  value={form.highlights}
                  onChange={(e) => set('highlights', e.target.value)}
                  placeholder={"Sea-facing view\nPremium marble flooring\nMetro connectivity"}
                  rows={5}
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

        </div>

        {/* Action bar */}
        <div className="mt-6 flex items-center justify-end gap-3 sticky bottom-0 bg-gray-50 py-4 border-t border-gray-200 -mx-6 px-6">
          <Link
            to="/properties"
            className="px-5 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {saving ? 'Saving…' : 'Save Property'}
          </button>
        </div>
      </form>
    </div>
  )
}

function formatPrice(p) {
  if (p >= 10000000) return `₹${(p / 10000000).toFixed(2)} Cr`
  if (p >= 100000) return `₹${(p / 100000).toFixed(1)} L`
  return p ? `₹${p.toLocaleString('en-IN')}` : ''
}
