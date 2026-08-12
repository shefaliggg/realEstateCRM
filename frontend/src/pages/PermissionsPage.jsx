import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  MODULE_OPTIONS,
  ROLE_OPTIONS,
  moduleKey,
  fetchRoles,
  updateRolePermissions,
} from '../utils/rolePermissions'

export default function PermissionsPage() {
  const { user, refreshUser } = useAuth()
  const [roles, setRoles] = useState(null)
  const [selectedRole, setSelectedRole] = useState('sales_executive')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchRoles()
      .then((data) => {
        if (cancelled) return
        setRoles(data)
        setLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err.response?.data?.message || 'Failed to load roles')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const activeRole = useMemo(
    () => roles?.find((r) => r.key === selectedRole) ?? null,
    [roles, selectedRole]
  )

  const enabledCount = useMemo(
    () => MODULE_OPTIONS.filter((module) => activeRole?.permissions?.includes(moduleKey(module))).length,
    [activeRole]
  )

  // Keeps any permission key outside the module toggle grid (e.g. the
  // manage_inventory/manage_users action permissions) untouched — this page
  // only ever edits module-level access.
  async function saveModulePermissions(nextModulePermissions) {
    if (!activeRole) return
    const actionPermissions = activeRole.permissions.filter((p) => !p.startsWith('module:'))
    const nextPermissions = [...actionPermissions, ...nextModulePermissions]

    setSaving(true)
    setError('')
    try {
      const updated = await updateRolePermissions(selectedRole, nextPermissions)
      setRoles((prev) => prev.map((r) => (r.key === selectedRole ? updated : r)))
      if (user?.role === selectedRole) {
        await refreshUser()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save permissions')
    } finally {
      setSaving(false)
    }
  }

  function updatePermission(module, checked) {
    const enabledModules = new Set(
      MODULE_OPTIONS.filter((m) => activeRole?.permissions?.includes(moduleKey(m)))
    )
    if (checked) enabledModules.add(module)
    else enabledModules.delete(module)
    saveModulePermissions([...enabledModules].map(moduleKey))
  }

  function setAll(checked) {
    saveModulePermissions(checked ? MODULE_OPTIONS.map(moduleKey) : [])
  }

  function onRoleChange(role) {
    setSelectedRole(role)
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-900">Permissions</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-4">
          <div className="flex items-center gap-2">
            <label htmlFor="role" className="text-sm text-gray-600">Role</label>
            <select
              id="role"
              value={selectedRole}
              onChange={(e) => onRoleChange(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-primary-200"
            >
              {ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {role.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="mt-4 text-sm text-red-600">{error}</div>}

        {loading ? (
          <div className="mt-5 text-sm text-gray-500">Loading roles…</div>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500">
                Enabled {enabledCount}/{MODULE_OPTIONS.length}
              </span>
              <button
                onClick={() => setAll(true)}
                disabled={saving}
                className="text-xs px-2.5 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Select all
              </button>
              <button
                onClick={() => setAll(false)}
                disabled={saving}
                className="text-xs px-2.5 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Clear all
              </button>
              {saving && <span className="text-xs text-gray-400">Saving…</span>}
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MODULE_OPTIONS.map((module) => (
                <label
                  key={module}
                  className="flex items-center gap-2.5 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(activeRole?.permissions?.includes(moduleKey(module)))}
                    onChange={(e) => updatePermission(module, e.target.checked)}
                    disabled={saving}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-800">{module}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
