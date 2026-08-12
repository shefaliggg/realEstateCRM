import { Link } from 'react-router-dom'

export default function Panel({ title, viewAllLink, viewAllLabel = 'View all →', loading, empty, emptyText = 'Nothing here yet', children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-800">{title}</h2>
        {viewAllLink && (
          <Link to={viewAllLink} className="text-xs text-primary-600 hover:underline">{viewAllLabel}</Link>
        )}
      </div>
      {loading ? (
        <div className="text-gray-300 text-sm py-4">Loading...</div>
      ) : empty ? (
        <div className="text-center py-6 text-gray-400 text-sm">{emptyText}</div>
      ) : (
        children
      )}
    </div>
  )
}
