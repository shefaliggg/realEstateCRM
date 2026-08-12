import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <div className="p-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs text-gray-500">Name</p>
            <p className="text-sm font-medium text-gray-900">{user?.name ?? 'Admin'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Email</p>
            <p className="text-sm font-medium text-gray-900">{user?.email ?? '-'}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Role</p>
            <p className="text-sm font-medium text-gray-900 capitalize">{user?.role?.replace(/_/g, ' ') ?? 'builder admin'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
