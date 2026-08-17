import { useEffect, useMemo, useState } from 'react'
import api from '../../api/axios'

export const inputCls = 'w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition'
export const selectCls = `${inputCls} text-gray-700`

export function Field({ label, children, className, hint }) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export function EditModal({ title, icon, onClose, onSubmit, saving, error, children, submitLabel = 'Save Changes', wide }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h2 className="font-semibold text-gray-900">{icon} {title}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none px-1">×</button>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="px-5 py-4 space-y-4 overflow-y-auto">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
            {children}
          </div>
          <div className="flex gap-3 px-5 py-4 border-t border-gray-100 shrink-0">
            <button type="submit" disabled={saving} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
              {saving ? 'Saving...' : submitLabel}
            </button>
            <button type="button" onClick={onClose} className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function EditPencilButton({ onClick, label = 'Edit', className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-primary-600 hover:border-primary-200 transition-colors shrink-0 ${className}`}
    >
      ✏️ {label}
    </button>
  )
}

export function HoverPhotoEdit({ onClick, title = 'Change photo', className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`absolute h-8 w-8 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center text-sm hover:bg-gray-50 hover:scale-105 transition-transform ${className}`}
    >
      📷
    </button>
  )
}

export function useProjectSave(id, onSaved) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async (payload, { multipart } = {}) => {
    setSaving(true)
    setError('')
    try {
      const res = await api.put(`/projects/${id}`, payload, multipart ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined)
      onSaved(res.data)
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes')
      return false
    } finally {
      setSaving(false)
    }
  }

  return { save, saving, error }
}

export function buildFormData(fields, files) {
  const fd = new FormData()
  Object.entries(fields || {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    fd.append(key, value)
  })
  Object.entries(files || {}).forEach(([key, fileList]) => {
    ;(Array.isArray(fileList) ? fileList : [fileList]).filter(Boolean).forEach((file) => fd.append(key, file))
  })
  return fd
}

// Manages a collection of existing (already-uploaded) URLs plus newly picked File objects,
// so a section can remove individual existing items and add new ones in the same save.
export function useFileCollection(initialUrls = []) {
  const [kept, setKept] = useState(initialUrls)
  const [added, setAdded] = useState([])

  const removeExisting = (url) => setKept((k) => k.filter((u) => u !== url))
  const addFiles = (fileList) => {
    const items = Array.from(fileList || []).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
    }))
    setAdded((a) => [...a, ...items])
  }
  const removeAdded = (fileId) => setAdded((a) => a.filter((x) => x.id !== fileId))

  return { kept, added, removeExisting, addFiles, removeAdded }
}

export function FileCollectionField({ label, collection, accept, hint, previewAs = 'image' }) {
  const { kept, added, removeExisting, addFiles, removeAdded } = collection
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 hover:border-primary-300 hover:bg-primary-50/40 transition-colors">
        <input type="file" accept={accept} multiple onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} className="hidden" />
        <span className="text-sm font-medium text-gray-700">Add Files</span>
        {hint && <span className="text-xs text-gray-500">{hint}</span>}
      </label>
      {(kept.length > 0 || added.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {kept.map((url) => (
            <div key={url} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1.5">
              {previewAs === 'image' ? <img src={url} alt="" className="h-8 w-8 rounded object-cover" /> : <span className="text-sm">📄</span>}
              <span className="max-w-[140px] truncate text-xs text-gray-600">{url.split('/').pop()}</span>
              <button type="button" onClick={() => removeExisting(url)} className="text-xs font-medium text-red-500 hover:text-red-600">×</button>
            </div>
          ))}
          {added.map((item) => (
            <div key={item.id} className="flex items-center gap-2 rounded-lg border border-primary-200 bg-primary-50/40 px-2 py-1.5">
              {item.preview ? <img src={item.preview} alt="" className="h-8 w-8 rounded object-cover" /> : <span className="text-sm">📄</span>}
              <span className="max-w-[140px] truncate text-xs text-gray-600">{item.file.name}</span>
              <button type="button" onClick={() => removeAdded(item.id)} className="text-xs font-medium text-red-500 hover:text-red-600">×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function SingleFileField({ label, currentUrl, file, onPick, accept, previewAs = 'image' }) {
  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }, [objectUrl])
  const preview = objectUrl || currentUrl
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        {preview ? (
          previewAs === 'image'
            ? <img src={preview} alt="" className="h-12 w-12 rounded-lg object-cover border border-gray-200" />
            : <a href={preview} target="_blank" rel="noreferrer" className="text-xs text-primary-600 hover:text-primary-700 underline">View current file</a>
        ) : (
          <span className="text-xs text-gray-400">Not uploaded</span>
        )}
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 hover:border-primary-300 hover:bg-primary-50/40 transition-colors">
          <input type="file" accept={accept} onChange={(e) => { const f = e.target.files?.[0]; if (f) onPick(f); e.target.value = '' }} className="hidden" />
          <span className="text-xs font-medium text-gray-700">{file || currentUrl ? 'Replace' : 'Upload'}</span>
        </label>
      </div>
    </div>
  )
}
