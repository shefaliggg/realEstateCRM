import { Link } from 'react-router-dom'

export default function StatTile({ icon, label, val, sub, color = 'bg-gray-50 text-gray-600', link, loading }) {
  const content = (
    <>
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-2 ${color}`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{loading ? '-' : val}</p>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{loading ? '' : sub}</p>}
    </>
  )

  const className = 'bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow'

  if (link) {
    return (
      <Link to={link} className={className}>
        {content}
      </Link>
    )
  }
  return <div className={className}>{content}</div>
}
