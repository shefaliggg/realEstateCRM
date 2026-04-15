import { useMemo, useState } from 'react'
import {
  MODULE_OPTIONS,
  ROLE_OPTIONS,
  getRoleModulePermissions,
  saveRoleModulePermissions,
} from '../utils/rolePermissions'

export default function PermissionsPage() {
  const [selectedRole, setSelectedRole] = useState('sales_executive')
  const [permissions, setPermissions] = useState(() => getRoleModulePermissions('sales_executive'))

  const enabledCount = useMemo(
    () => MODULE_OPTIONS.filter((module) => permissions[module]).length,
    [permissions]
  )

  function onRoleChange(role) {
    setSelectedRole(role)
    setPermissions(getRoleModulePermissions(role))
  }

  function updatePermission(module, checked) {
    const next = {
      ...permissions,
      [module]: checked,
    }
    setPermissions(next)
    saveRoleModulePermissions(selectedRole, next)
  }

  function setAll(checked) {
    const next = {}
    for (const module of MODULE_OPTIONS) {
      next[module] = checked
    }
    setPermissions(next)
    saveRoleModulePermissions(selectedRole, next)
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

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500">
            Enabled {enabledCount}/{MODULE_OPTIONS.length}
          </span>
          <button
            onClick={() => setAll(true)}
            className="text-xs px-2.5 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Select all
          </button>
          <button
            onClick={() => setAll(false)}
            className="text-xs px-2.5 py-1 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Clear all
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MODULE_OPTIONS.map((module) => (
            <label
              key={module}
              className="flex items-center gap-2.5 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={Boolean(permissions[module])}
                onChange={(e) => updatePermission(module, e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-800">{module}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
