import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function SettingsTab({ id, project }) {
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    setError('')
    try {
      await api.delete(`/projects/${id}`)
      navigate('/projects')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete project')
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-gray-800">Project Settings</h3>
          <p className="text-sm text-gray-500 mt-0.5">Update name, status, dates, pricing, sales info, and contact details.</p>
        </div>
        <Link to={`/projects/${id}/edit`} className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors shrink-0">
          ✏️ Edit Project
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-semibold text-gray-800 mb-3">Project Info</h3>
        <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between"><dt className="text-gray-500">Type</dt><dd className="font-medium">{project.type}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd className="font-medium">{project.status}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Created</dt><dd className="font-medium">{new Date(project.createdAt).toLocaleDateString('en-IN')}</dd></div>
          <div className="flex justify-between"><dt className="text-gray-500">Last Updated</dt><dd className="font-medium">{new Date(project.updatedAt).toLocaleDateString('en-IN')}</dd></div>
        </dl>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

      <div className="rounded-xl border border-red-200 bg-red-50 p-5">
        <h3 className="font-semibold text-red-800 mb-1">Danger Zone</h3>
        <p className="text-sm text-red-600 mb-3">Deleting a project permanently removes it, including its inventory. This cannot be undone.</p>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="text-sm font-medium px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? 'Deleting...' : confirmDelete ? 'Click again to confirm delete' : 'Delete Project'}
        </button>
      </div>
    </div>
  )
}
