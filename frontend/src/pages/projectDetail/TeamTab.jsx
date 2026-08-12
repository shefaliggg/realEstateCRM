import { useEffect, useRef, useState } from 'react'
import api from '../../api/axios'
import { getInitials } from './shared'

const KNOWN_DESIGNATIONS = [
  'Project Manager', 'Sales Manager', 'Sales Executive', 'Site Engineer', 'Site Supervisor',
  'CRM Manager', 'CRM Executive', 'Marketing Manager', 'Accounts / Finance', 'Legal Advisor',
]
const DESIGNATIONS = [...KNOWN_DESIGNATIONS, 'Other']

export default function TeamTab({ id, project, users, onProjectChanged }) {
  const assignedUsers = Array.isArray(project?.managedBy) ? project.managedBy : []
  const existingDesignations = Array.isArray(project?.teamDesignations) ? project.teamDesignations : []

  const [selectedManagers, setSelectedManagers] = useState(assignedUsers.map((u) => (typeof u === 'string' ? u : u._id)))
  const [designations, setDesignations] = useState(() => {
    const map = {}
    existingDesignations.forEach((d) => {
      const userId = typeof d.user === 'string' ? d.user : d.user?._id
      if (userId) map[userId] = d.designation || ''
    })
    return map
  })
  const [otherMode, setOtherMode] = useState(new Set())
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [managerSearch, setManagerSearch] = useState('')
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!dropdownOpen) return
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dropdownOpen])

  const toggleManager = (userId) => {
    setSelectedManagers((prev) => {
      if (prev.includes(userId)) {
        setDesignations((d) => {
          const next = { ...d }
          delete next[userId]
          return next
        })
        setOtherMode((o) => {
          if (!o.has(userId)) return o
          const next = new Set(o)
          next.delete(userId)
          return next
        })
        return prev.filter((v) => v !== userId)
      }
      return [...prev, userId]
    })
  }

  const setDesignation = (userId, value) => {
    setDesignations((d) => ({ ...d, [userId]: value }))
  }

  const selectDesignation = (userId, choice) => {
    setOtherMode((prev) => {
      const next = new Set(prev)
      choice === 'Other' ? next.add(userId) : next.delete(userId)
      return next
    })
    setDesignation(userId, choice === 'Other' ? '' : choice)
  }

  const handleSave = async () => {
    if (saving) return
    setSaving(true)
    setMessage('')
    try {
      const teamDesignations = selectedManagers.map((userId) => ({ user: userId, designation: designations[userId] || '' }))
      const res = await api.put(`/projects/${id}`, { managedBy: selectedManagers, teamDesignations })
      onProjectChanged?.(res.data)
      setMessage('Team saved.')
    } catch {
      setMessage('Failed to save team.')
    } finally {
      setSaving(false)
    }
  }

  const filteredUsers = (users || []).filter((u) => {
    const q = managerSearch.trim().toLowerCase()
    if (!q) return true
    return [u.name, u.email, u.phone, u.role].some((v) => v?.toLowerCase().includes(q))
  })
  const selectedUsers = (users || []).filter((u) => selectedManagers.includes(u._id))
  const displaySelectedUsers = selectedManagers
    .map((userId) => (users || []).find((u) => u._id === userId) || assignedUsers.find((u) => (typeof u === 'object' ? u._id : u) === userId))
    .filter(Boolean)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Team Members</h3>
        <p className="text-sm text-gray-500 mb-4">Assign users to this project and set their designation / role for it.</p>

        {(users || []).length === 0 ? (
          <p className="text-xs text-gray-500">No users available to assign.</p>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-left transition hover:border-primary-300"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm text-gray-700">
                  {selectedUsers.length === 0 ? '+ Add team member' : selectedUsers.map((u) => u.name).join(', ')}
                </p>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 shrink-0">{selectedUsers.length}</span>
              </div>
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 top-full z-10 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg">
                <div className="border-b border-gray-100 p-2.5">
                  <input
                    value={managerSearch}
                    onChange={(e) => setManagerSearch(e.target.value)}
                    placeholder="Search by name, email, phone or role"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto p-2">
                  {filteredUsers.map((u) => {
                    const checked = selectedManagers.includes(u._id)
                    return (
                      <label key={u._id} className={`flex items-center gap-3 rounded-lg px-3 py-2 cursor-pointer transition ${checked ? 'bg-primary-50' : 'hover:bg-gray-50'}`}>
                        <input type="checkbox" checked={checked} onChange={() => toggleManager(u._id)} className="h-4 w-4 rounded border-gray-300 text-primary-600" />
                        <span className="h-8 w-8 rounded-full bg-slate-100 text-xs font-bold text-slate-700 flex items-center justify-center">{getInitials(u.name)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">{u.name}</p>
                          <p className="truncate text-xs text-gray-500">{u.email} · {u.role}</p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-semibold text-gray-800">Designations</h3>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{displaySelectedUsers.length} assigned</span>
        </div>

        {displaySelectedUsers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
            No team members assigned yet. Add one above.
          </div>
        ) : (
          <div className="space-y-3">
            {displaySelectedUsers.map((u) => {
              const raw = designations[u._id] || ''
              const selectValue = otherMode.has(u._id) ? 'Other' : (KNOWN_DESIGNATIONS.includes(raw) ? raw : (raw ? 'Other' : ''))
              const showCustomInput = selectValue === 'Other'
              return (
                <div key={u._id} className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-slate-50 p-3">
                  {u.image ? (
                    <img src={u.image} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-gray-200 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold border border-primary-200 shrink-0">
                      {getInitials(u.name)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{u.name}</p>
                    <p className="text-xs text-gray-500 truncate">{u.email || 'No email'} · System role: {u.role || 'User'}</p>
                  </div>
                  <select
                    value={selectValue}
                    onChange={(e) => selectDesignation(u._id, e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white min-w-[10rem]"
                  >
                    <option value="">Select designation</option>
                    {DESIGNATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {showCustomInput && (
                    <input
                      value={raw}
                      onChange={(e) => setDesignation(u._id, e.target.value)}
                      placeholder="Custom designation"
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 w-40"
                      autoFocus
                    />
                  )}
                  <button type="button" onClick={() => toggleManager(u._id)} className="text-xs font-medium text-red-500 hover:text-red-700 shrink-0">
                    Remove
                  </button>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-4">
          {message && <p className="text-xs text-gray-500">{message}</p>}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Team'}
          </button>
        </div>
      </div>
    </div>
  )
}
