import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'

const STEPS = [
  'Basic Info',
  'Location',
  'Project Details',
  'Unit Configuration',
  'Nearby Locations',
  'Media & Documents',
  'Sales & Contact',
  'Review & Publish',
]

const STATUS_OPTIONS = ['Pre-Launch', 'New Launch', 'Under Construction', 'Ready to Move', 'Completed', 'Sold Out']
const BHK_TYPES = ['Studio', '1 BHK', '1.5 BHK', '2 BHK', '2.5 BHK', '3 BHK', '3.5 BHK', '4 BHK', '4.5 BHK', '5 BHK', 'Duplex', 'Penthouse']
const BLOCK_PRESETS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

const NEARBY_TYPES = ['School', 'Hospital', 'Metro', 'Railway Station', 'Airport', 'Mall', 'IT Park', 'Bus Stand']

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
]

const STATE_CITIES = {
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Navi Mumbai'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli'],
  'Delhi': ['New Delhi', 'Delhi'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
  'Uttar Pradesh': ['Lucknow', 'Noida', 'Ghaziabad', 'Kanpur', 'Varanasi', 'Greater Noida'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur'],
  'Haryana': ['Gurugram', 'Faridabad', 'Panchkula'],
  'Kerala': ['Kochi', 'Thiruvananthapuram', 'Kozhikode'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur'],
  'Madhya Pradesh': ['Bhopal', 'Indore', 'Jabalpur'],
  'Bihar': ['Patna', 'Gaya'],
  'Odisha': ['Bhubaneswar', 'Cuttack'],
  'Chandigarh': ['Chandigarh'],
}

const extractLatLngFromMapLink = (link) => {
  if (!link) return null
  const patterns = [/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, /@(-?\d+\.\d+),(-?\d+\.\d+)/, /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/, /[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/]
  for (const pattern of patterns) {
    const match = link.match(pattern)
    if (match) return { latitude: match[1], longitude: match[2] }
  }
  return null
}

const EMPTY_FORM = {
  name: '', developerName: '', description: '',
  country: 'India', state: '', city: '', locality: '', address: '', landmark: '', pincode: '', googleMapLink: '',
  status: 'Pre-Launch', reraNo: '', reraRegistrationDate: '', launchDate: '', possessionDate: '', constructionStartDate: '',
  totalLandArea: '', numberOfTowers: '', numberOfFloors: '',
  blocks: [], bhkTypes: [], unitConfigurations: [],
  nearbyLocations: [],
  virtualTourLink: '',
  managedBy: [], bookingOpen: false, bankLoanAvailable: false, approvedBanks: [], salesOfficeAddress: '', siteOfficeContact: '', crmNotes: '',
  salesPhone: '', alternatePhone: '', whatsapp: '', email: '', website: '',
  slug: '', metaTitle: '', metaDescription: '', keywords: [],
}

const EMPTY_FILES = {
  logo: [], images: [], floorPlanImages: [], masterPlanImage: [], constructionProgressPhotos: [], videos: [],
  reraCertificate: [], brochure: [], priceSheet: [], paymentPlan: [], occupancyCertificate: [], completionCertificate: [], legalDocuments: [], approvalDocuments: [],
}

const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder:text-gray-300'
const selectCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition text-gray-700'

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

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h2 className="font-semibold text-gray-800">{icon} {title}</h2>
      {children}
    </div>
  )
}

function TagInput({ label, values, onAdd, onRemove, placeholder, presets }) {
  const [value, setValue] = useState('')
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {presets.map((p) => (
            <button key={p} type="button" onClick={() => onAdd(p)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              + {p}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2 mb-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={inputCls}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => { onAdd(value); setValue('') }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.length === 0 && <span className="text-xs text-gray-400">None added yet</span>}
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
            {v}
            <button type="button" onClick={() => onRemove(v)} className="text-primary-600 hover:text-primary-800">×</button>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function AddBuildingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(EMPTY_FORM)
  const [files, setFiles] = useState(EMPTY_FILES)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [cityCustom, setCityCustom] = useState(false)
  const filesRef = useRef(files)

  useEffect(() => { filesRef.current = files }, [files])
  useEffect(() => {
    return () => {
      Object.values(filesRef.current).forEach((bucket) =>
        bucket.forEach((item) => { if (item.preview) URL.revokeObjectURL(item.preview) })
      )
    }
  }, [])

  useEffect(() => {
    setUsersLoading(true)
    api.get('/users')
      .then((r) => setUsers(r.data))
      .catch(() => {})
      .finally(() => setUsersLoading(false))
  }, [])

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const onChange = (key) => (e) => set(key, e.target.value)

  const toggleFromArray = (key, value) =>
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value) ? f[key].filter((x) => x !== value) : [...f[key], value],
    }))

  const addToArray = (key) => (value) => {
    const v = String(value || '').trim()
    if (!v) return
    setForm((f) => (f[key].some((x) => x.toLowerCase() === v.toLowerCase()) ? f : { ...f, [key]: [...f[key], v] }))
  }
  const removeFromArray = (key) => (value) => setForm((f) => ({ ...f, [key]: f[key].filter((x) => x !== value) }))

  const addFiles = (key, multiple) => (e) => {
    const selected = Array.from(e.target.files || [])
    if (selected.length === 0) return
    const items = selected.map((file) => ({
      id: `${key}-${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }))
    setFiles((f) => ({ ...f, [key]: multiple ? [...f[key], ...items] : [items[0]] }))
    e.target.value = ''
  }

  const removeFile = (key, id) => {
    setFiles((f) => {
      const item = f[key].find((x) => x.id === id)
      if (item?.preview) URL.revokeObjectURL(item.preview)
      return { ...f, [key]: f[key].filter((x) => x.id !== id) }
    })
  }

  function FileField({ label, fieldKey, multiple, accept, hint }) {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 hover:border-primary-300 hover:bg-primary-50/40 transition-colors">
          <input type="file" accept={accept} multiple={multiple} onChange={addFiles(fieldKey, multiple)} className="hidden" />
          <span className="text-sm font-medium text-gray-700">Upload</span>
          {hint && <span className="text-xs text-gray-500">{hint}</span>}
        </label>
        {files[fieldKey].length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {files[fieldKey].map((item) => (
              <div key={item.id} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5">
                {item.preview ? (
                  <img src={item.preview} alt="" className="h-8 w-8 rounded object-cover" />
                ) : (
                  <span className="text-sm">📄</span>
                )}
                <span className="max-w-[140px] truncate text-xs text-gray-600">{item.file.name}</span>
                <button type="button" onClick={() => removeFile(fieldKey, item.id)} className="text-xs font-medium text-red-500 hover:text-red-600">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const addBlock = (b) => addToArray('blocks')(b)
  const removeBlock = (b) => removeFromArray('blocks')(b)

  const addUnitConfig = () =>
    setForm((f) => ({ ...f, unitConfigurations: [...f.unitConfigurations, { bhk: '', units: '', areaFrom: '', areaTo: '', startingPrice: '' }] }))
  const updateUnitConfig = (idx, key, value) =>
    setForm((f) => ({
      ...f,
      unitConfigurations: f.unitConfigurations.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    }))
  const removeUnitConfig = (idx) =>
    setForm((f) => ({ ...f, unitConfigurations: f.unitConfigurations.filter((_, i) => i !== idx) }))

  const addNearby = () =>
    setForm((f) => ({ ...f, nearbyLocations: [...f.nearbyLocations, { type: NEARBY_TYPES[0], name: '', distance: '' }] }))
  const updateNearby = (idx, key, value) =>
    setForm((f) => ({
      ...f,
      nearbyLocations: f.nearbyLocations.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    }))
  const removeNearby = (idx) =>
    setForm((f) => ({ ...f, nearbyLocations: f.nearbyLocations.filter((_, i) => i !== idx) }))

  const validateStep = () => {
    if (step === 1 && (!form.name.trim() || !form.developerName.trim())) {
      return 'Project name and developer/builder name are required'
    }
    if (step === 2 && !form.city.trim()) {
      return 'City is required'
    }
    return ''
  }

  const goNext = () => {
    const err = validateStep()
    if (err) { setError(err); return }
    setError('')
    setStep((s) => Math.min(s + 1, STEPS.length))
  }
  const goBack = () => { setError(''); setStep((s) => Math.max(s - 1, 1)) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step !== STEPS.length) return
    setError('')
    setLoading(true)
    try {
      const fd = new FormData()
      const append = (key, value) => { if (value !== '' && value !== undefined && value !== null) fd.append(key, value) }

      append('name', form.name)
      append('developerName', form.developerName)
      append('description', form.description)
      append('type', 'Buildings')

      append('country', form.country)
      append('state', form.state)
      append('city', form.city)
      append('locality', form.locality)
      append('address', form.address)
      append('landmark', form.landmark)
      append('pincode', form.pincode)
      append('googleMapLink', form.googleMapLink)
      const latLng = extractLatLngFromMapLink(form.googleMapLink)
      if (latLng) {
        append('latitude', latLng.latitude)
        append('longitude', latLng.longitude)
      }

      append('status', form.status)
      append('reraNo', form.reraNo)
      append('reraRegistrationDate', form.reraRegistrationDate)
      append('launchDate', form.launchDate)
      append('possessionDate', form.possessionDate)
      append('constructionStartDate', form.constructionStartDate)
      append('totalLandArea', form.totalLandArea)
      append('numberOfTowers', form.numberOfTowers)
      append('numberOfFloors', form.numberOfFloors)

      fd.append('blocks', JSON.stringify(form.blocks))
      fd.append('bhkTypes', JSON.stringify(form.bhkTypes))
      fd.append('unitConfigurations', JSON.stringify(form.unitConfigurations.filter((r) => r.bhk)))

      fd.append('nearbyLocations', JSON.stringify(form.nearbyLocations.filter((r) => r.name)))

      append('virtualTourLink', form.virtualTourLink)

      fd.append('managedBy', JSON.stringify(form.managedBy))
      fd.append('bookingOpen', String(form.bookingOpen))
      fd.append('bankLoanAvailable', String(form.bankLoanAvailable))
      fd.append('approvedBanks', JSON.stringify(form.approvedBanks))
      append('salesOfficeAddress', form.salesOfficeAddress)
      append('siteOfficeContact', form.siteOfficeContact)
      append('crmNotes', form.crmNotes)

      append('salesPhone', form.salesPhone)
      append('alternatePhone', form.alternatePhone)
      append('whatsapp', form.whatsapp)
      append('email', form.email)
      append('website', form.website)

      append('slug', form.slug)
      append('metaTitle', form.metaTitle)
      append('metaDescription', form.metaDescription)
      fd.append('keywords', JSON.stringify(form.keywords))

      const fileFieldMap = {
        logo: 'logo', images: 'images', videos: 'videos',
        floorPlanImages: 'floorPlanImages', masterPlanImage: 'masterPlanImage', constructionProgressPhotos: 'constructionProgressPhotos',
        reraCertificate: 'reraCertificate', brochure: 'brochure', priceSheet: 'priceSheet', paymentPlan: 'paymentPlan',
        occupancyCertificate: 'occupancyCertificate', completionCertificate: 'completionCertificate',
        legalDocuments: 'legalDocuments', approvalDocuments: 'approvalDocuments',
      }
      Object.entries(fileFieldMap).forEach(([stateKey, fieldName]) => {
        files[stateKey].forEach((item) => fd.append(fieldName, item.file))
      })

      const res = await api.post('/projects', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      navigate(`/projects/${res.data._id}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create building')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
        <Link to="/projects/types/buildings" className="hover:text-primary-600">Buildings</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Add Building</span>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">🏢 Add Apartment Building</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 mb-6 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {STEPS.map((label, i) => {
            const n = i + 1
            return (
              <div key={label} className="flex items-center">
                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                  step === n ? 'bg-primary-600 text-white' : step > n ? 'bg-primary-50 text-primary-700' : 'text-gray-400'
                }`}>
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${
                    step === n ? 'bg-white/20' : step > n ? 'bg-primary-100' : 'bg-gray-100'
                  }`}>{n}</span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {n < STEPS.length && <div className="w-4 h-px bg-gray-200 mx-1" />}
              </div>
            )
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {step === 1 && (
          <SectionCard title="Basic Information" icon="📋">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Project Name" required>
                <input value={form.name} onChange={onChange('name')} className={inputCls} placeholder="Skyline Residency" />
              </Field>
              <Field label="Developer / Builder" required>
                <input value={form.developerName} onChange={onChange('developerName')} className={inputCls} placeholder="VMR Developers" />
              </Field>
            </div>
            <Field label="Project Description">
              <textarea value={form.description} onChange={onChange('description')} rows={4} className={inputCls} placeholder="Brief description of the building project..." />
            </Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FileField label="Project Logo" fieldKey="logo" accept="image/*" hint="1 image" />
              <FileField label="Project Gallery" fieldKey="images" multiple accept="image/*" hint="Up to 8 images — first image is used as the cover" />
            </div>
          </SectionCard>
        )}

        {step === 2 && (
          <SectionCard title="Location" icon="📍">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Country">
                <input value={form.country} onChange={onChange('country')} className={inputCls} />
              </Field>
              <Field label="State">
                <select
                  value={form.state}
                  onChange={(e) => {
                    set('state', e.target.value)
                    set('city', '')
                    setCityCustom(false)
                  }}
                  className={selectCls}
                >
                  <option value="">Select state</option>
                  {INDIA_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="City" required>
                {STATE_CITIES[form.state] ? (
                  <>
                    <select
                      value={cityCustom ? 'Other' : form.city}
                      onChange={(e) => {
                        const v = e.target.value
                        if (v === 'Other') { setCityCustom(true); set('city', '') }
                        else { setCityCustom(false); set('city', v) }
                      }}
                      className={selectCls}
                    >
                      <option value="">Select city</option>
                      {STATE_CITIES[form.state].map((c) => <option key={c}>{c}</option>)}
                      <option value="Other">Other (specify)</option>
                    </select>
                    {cityCustom && (
                      <input value={form.city} onChange={onChange('city')} className={`${inputCls} mt-2`} placeholder="Enter city" />
                    )}
                  </>
                ) : (
                  <input value={form.city} onChange={onChange('city')} className={inputCls} placeholder="Select a state first, or type city" />
                )}
              </Field>
              <Field label="Locality">
                <input value={form.locality} onChange={onChange('locality')} className={inputCls} placeholder="Gachibowli" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Address">
                  <input value={form.address} onChange={onChange('address')} className={inputCls} placeholder="Street address" />
                </Field>
              </div>
              <Field label="Landmark">
                <input value={form.landmark} onChange={onChange('landmark')} className={inputCls} placeholder="Near ORR Exit 4" />
              </Field>
              <Field label="Pincode">
                <input value={form.pincode} onChange={onChange('pincode')} className={inputCls} placeholder="500032" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Google Maps Location" hint="Coordinates are extracted automatically from this link">
                  <input value={form.googleMapLink} onChange={onChange('googleMapLink')} className={inputCls} placeholder="https://maps.google.com/..." />
                </Field>
              </div>
            </div>
          </SectionCard>
        )}

        {step === 3 && (
          <SectionCard title="Project Details" icon="🏗️">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Project Status">
                <select value={form.status} onChange={onChange('status')} className={selectCls}>
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="RERA Number">
                <input value={form.reraNo} onChange={onChange('reraNo')} className={inputCls} placeholder="P02400001234" />
              </Field>
              <Field label="RERA Registration Date">
                <input type="date" value={form.reraRegistrationDate} onChange={onChange('reraRegistrationDate')} className={inputCls} />
              </Field>
              <Field label="Launch Date">
                <input type="date" value={form.launchDate} onChange={onChange('launchDate')} className={inputCls} />
              </Field>
              <Field label="Possession Date">
                <input type="date" value={form.possessionDate} onChange={onChange('possessionDate')} className={inputCls} />
              </Field>
              <Field label="Construction Start Date">
                <input type="date" value={form.constructionStartDate} onChange={onChange('constructionStartDate')} className={inputCls} />
              </Field>
              <Field label="Total Land Area">
                <input value={form.totalLandArea} onChange={onChange('totalLandArea')} className={inputCls} placeholder="5 Acres" />
              </Field>
              <Field label="Number of Towers">
                <input type="number" value={form.numberOfTowers} onChange={onChange('numberOfTowers')} className={inputCls} />
              </Field>
              <Field label="Number of Floors">
                <input type="number" value={form.numberOfFloors} onChange={onChange('numberOfFloors')} className={inputCls} />
              </Field>
            </div>
            <p className="text-xs text-gray-400">Total units will be calculated automatically from the flats you add to each tower after this building is created.</p>
            <TagInput
              label="Towers"
              values={form.blocks}
              onAdd={addBlock}
              onRemove={removeBlock}
              placeholder="Add custom tower name (e.g. Tower-1)"
              presets={BLOCK_PRESETS}
            />
          </SectionCard>
        )}

        {step === 4 && (
          <>
            <SectionCard title="Unit Configuration" icon="🛏">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                      <th className="py-2 pr-2">BHK</th>
                      <th className="py-2 pr-2">Units</th>
                      <th className="py-2 pr-2">Area From</th>
                      <th className="py-2 pr-2">Area To</th>
                      <th className="py-2 pr-2">Starting Price</th>
                      <th className="py-2"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.unitConfigurations.map((row, idx) => (
                      <tr key={idx} className="border-b border-gray-50">
                        <td className="py-2 pr-2">
                          <select value={row.bhk} onChange={(e) => updateUnitConfig(idx, 'bhk', e.target.value)} className={selectCls}>
                            <option value="">Select</option>
                            {BHK_TYPES.map((b) => <option key={b}>{b}</option>)}
                          </select>
                        </td>
                        <td className="py-2 pr-2">
                          <input type="number" value={row.units} onChange={(e) => updateUnitConfig(idx, 'units', e.target.value)} className={inputCls} />
                        </td>
                        <td className="py-2 pr-2">
                          <input type="number" value={row.areaFrom} onChange={(e) => updateUnitConfig(idx, 'areaFrom', e.target.value)} className={inputCls} />
                        </td>
                        <td className="py-2 pr-2">
                          <input type="number" value={row.areaTo} onChange={(e) => updateUnitConfig(idx, 'areaTo', e.target.value)} className={inputCls} />
                        </td>
                        <td className="py-2 pr-2">
                          <input type="number" value={row.startingPrice} onChange={(e) => updateUnitConfig(idx, 'startingPrice', e.target.value)} className={inputCls} />
                        </td>
                        <td className="py-2">
                          <button type="button" onClick={() => removeUnitConfig(idx)} className="text-xs font-medium text-red-500 hover:text-red-600">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {form.unitConfigurations.length === 0 && (
                  <p className="text-xs text-gray-400 py-2">No configurations added yet</p>
                )}
              </div>
              <button type="button" onClick={addUnitConfig} className="text-sm font-medium text-primary-600 hover:text-primary-700">+ Add Configuration</button>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">BHK Types (quick filters)</label>
                <div className="flex flex-wrap gap-2">
                  {BHK_TYPES.map((b) => (
                    <button type="button" key={b} onClick={() => toggleFromArray('bhkTypes', b)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        form.bhkTypes.includes(b) ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </SectionCard>
          </>
        )}

        {step === 5 && (
          <SectionCard title="Nearby Locations" icon="📌">
            <div className="space-y-3">
              {form.nearbyLocations.map((row, idx) => (
                <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr,1.5fr,1fr,auto] items-center">
                  <select value={row.type} onChange={(e) => updateNearby(idx, 'type', e.target.value)} className={selectCls}>
                    {NEARBY_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <input value={row.name} onChange={(e) => updateNearby(idx, 'name', e.target.value)} className={inputCls} placeholder="Name (e.g. DPS School)" />
                  <input value={row.distance} onChange={(e) => updateNearby(idx, 'distance', e.target.value)} className={inputCls} placeholder="2.5 km" />
                  <button type="button" onClick={() => removeNearby(idx)} className="text-xs font-medium text-red-500 hover:text-red-600">Remove</button>
                </div>
              ))}
              {form.nearbyLocations.length === 0 && <p className="text-xs text-gray-400">No nearby locations added yet</p>}
            </div>
            <button type="button" onClick={addNearby} className="text-sm font-medium text-primary-600 hover:text-primary-700">+ Add Nearby Location</button>
          </SectionCard>
        )}

        {step === 6 && (
          <>
            <SectionCard title="Media" icon="🖼">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FileField label="Floor Plan Images" fieldKey="floorPlanImages" multiple accept="image/*" hint="Up to 8 images" />
                <FileField label="Master Plan" fieldKey="masterPlanImage" accept="image/*,application/pdf" hint="1 file" />
                <FileField label="Construction Progress Photos" fieldKey="constructionProgressPhotos" multiple accept="image/*" hint="Up to 12 images" />
                <FileField label="Videos" fieldKey="videos" multiple accept="video/*" hint="Up to 4 videos" />
              </div>
              <Field label="360° Virtual Tour Link">
                <input value={form.virtualTourLink} onChange={onChange('virtualTourLink')} className={inputCls} placeholder="https://..." />
              </Field>
            </SectionCard>

            <SectionCard title="Documents" icon="📄">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FileField label="RERA Certificate" fieldKey="reraCertificate" accept="application/pdf,image/*" />
                <FileField label="Brochure (PDF)" fieldKey="brochure" accept="application/pdf" />
                <FileField label="Price Sheet" fieldKey="priceSheet" accept="application/pdf,image/*" />
                <FileField label="Payment Plan" fieldKey="paymentPlan" accept="application/pdf,image/*" />
                <FileField label="Legal Documents" fieldKey="legalDocuments" multiple accept="application/pdf,image/*" hint="Up to 5 files" />
                <FileField label="Approval Documents" fieldKey="approvalDocuments" multiple accept="application/pdf,image/*" hint="Up to 5 files" />
                <FileField label="Occupancy Certificate (OC)" fieldKey="occupancyCertificate" accept="application/pdf,image/*" />
                <FileField label="Completion Certificate (CC)" fieldKey="completionCertificate" accept="application/pdf,image/*" />
              </div>
            </SectionCard>
          </>
        )}

        {step === 7 && (
          <>
            <SectionCard title="Sales Information" icon="💼">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Booking Open">
                  <div className="flex items-center h-[42px]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.bookingOpen} onChange={(e) => set('bookingOpen', e.target.checked)} className="w-4 h-4 accent-primary-600" />
                      <span className="text-sm text-gray-600">Bookings currently open</span>
                    </label>
                  </div>
                </Field>
                <Field label="Bank Loan Available">
                  <div className="flex items-center h-[42px]">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.bankLoanAvailable} onChange={(e) => set('bankLoanAvailable', e.target.checked)} className="w-4 h-4 accent-primary-600" />
                      <span className="text-sm text-gray-600">Home loan financing available</span>
                    </label>
                  </div>
                </Field>
                <Field label="Sales Office Address">
                  <input value={form.salesOfficeAddress} onChange={onChange('salesOfficeAddress')} className={inputCls} />
                </Field>
                <Field label="Site Office Contact">
                  <input value={form.siteOfficeContact} onChange={onChange('siteOfficeContact')} className={inputCls} />
                </Field>
              </div>
              <TagInput label="Approved Banks" values={form.approvedBanks} onAdd={addToArray('approvedBanks')} onRemove={removeFromArray('approvedBanks')} placeholder="e.g. HDFC, SBI, ICICI" />
              <Field label="CRM Notes">
                <textarea value={form.crmNotes} onChange={onChange('crmNotes')} rows={3} className={inputCls} placeholder="Internal notes for the sales team..." />
              </Field>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Assigned Sales Manager / Team</label>
                {usersLoading && <p className="text-sm text-gray-400">Loading users...</p>}
                {!usersLoading && users.length === 0 && <p className="text-sm text-gray-400">No users found.</p>}
                {!usersLoading && users.length > 0 && (
                  <div className="divide-y divide-gray-50 border border-gray-100 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    {users.map((user) => {
                      const selected = form.managedBy.includes(user._id)
                      return (
                        <label key={user._id} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${selected ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => setForm((f) => ({
                              ...f,
                              managedBy: selected ? f.managedBy.filter((id) => id !== user._id) : [...f.managedBy, user._id],
                            }))}
                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email} · {user.role}</p>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            </SectionCard>

            <SectionCard title="Contact Details" icon="📞">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Sales Phone"><input value={form.salesPhone} onChange={onChange('salesPhone')} className={inputCls} /></Field>
                <Field label="Alternate Phone"><input value={form.alternatePhone} onChange={onChange('alternatePhone')} className={inputCls} /></Field>
                <Field label="WhatsApp"><input value={form.whatsapp} onChange={onChange('whatsapp')} className={inputCls} /></Field>
                <Field label="Email"><input type="email" value={form.email} onChange={onChange('email')} className={inputCls} /></Field>
                <div className="sm:col-span-2">
                  <Field label="Website"><input value={form.website} onChange={onChange('website')} className={inputCls} placeholder="https://..." /></Field>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="SEO" icon="🔍">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Slug"><input value={form.slug} onChange={onChange('slug')} className={inputCls} placeholder="skyline-residency" /></Field>
                <Field label="Meta Title"><input value={form.metaTitle} onChange={onChange('metaTitle')} className={inputCls} /></Field>
                <div className="sm:col-span-2">
                  <Field label="Meta Description"><textarea value={form.metaDescription} onChange={onChange('metaDescription')} rows={2} className={inputCls} /></Field>
                </div>
              </div>
              <TagInput label="Keywords" values={form.keywords} onAdd={addToArray('keywords')} onRemove={removeFromArray('keywords')} placeholder="e.g. 3bhk gachibowli" />
            </SectionCard>
          </>
        )}

        {step === 8 && (
          <SectionCard title="Review & Publish" icon="✅">
            <p className="text-sm text-gray-500">Double-check the key details below, then create the building. You can add towers, floors, and individual units from the project page afterwards.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-400 mb-1">Project Name</p>
                <p className="font-medium text-gray-900">{form.name || '—'}</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-400 mb-1">Developer</p>
                <p className="font-medium text-gray-900">{form.developerName || '—'}</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-400 mb-1">Location</p>
                <p className="font-medium text-gray-900">{[form.locality, form.city, form.state].filter(Boolean).join(', ') || '—'}</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <p className="font-medium text-gray-900">{form.status}</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-400 mb-1">Towers</p>
                <p className="font-medium text-gray-900">{form.blocks.length || '—'}</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-400 mb-1">Configurations</p>
                <p className="font-medium text-gray-900">{form.unitConfigurations.filter((r) => r.bhk).length || 0} added</p>
              </div>
              <div className="rounded-lg border border-gray-100 p-3">
                <p className="text-xs text-gray-400 mb-1">Assigned Team</p>
                <p className="font-medium text-gray-900">{form.managedBy.length} user(s)</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">Inventory summary (available / booked / sold / blocked units) is calculated automatically once units are added to this building.</p>
            <p className="text-xs text-gray-400">Common amenities are set from this project's Profile tab. Tower-specific amenities and specifications are set per tower — add them from a tower's page after creating this building.</p>
          </SectionCard>
        )}

        <div className="flex gap-3">
          {step > 1 && (
            <button type="button" onClick={goBack} className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              Back
            </button>
          )}
          {step < STEPS.length && (
            <button type="button" onClick={goNext} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
              Continue
            </button>
          )}
          {step === STEPS.length && (
            <button type="submit" disabled={loading} className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
              {loading ? 'Creating...' : 'Create Building'}
            </button>
          )}
          <Link to="/projects/types/buildings" className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
