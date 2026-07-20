import { Link } from 'react-router-dom'
import { formatDate } from './shared'

const STATUS_COLORS = {
  Planned: 'bg-gray-100 text-gray-600',
  'Under Construction': 'bg-yellow-100 text-yellow-700',
  Ready: 'bg-green-100 text-green-700',
}

export default function TowerCard({ id, tower }) {
  const stats = tower.unitStats || {}
  const sold = stats.registered || 0

  return (
    <Link
      to={`/projects/${id}/blocks/${encodeURIComponent(tower.name)}`}
      className="rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-primary-200 transition-all p-4 block"
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <h4 className="font-semibold text-gray-900">Tower {tower.name}</h4>
        {tower.status && (
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[tower.status] || 'bg-gray-100 text-gray-600'}`}>
            {tower.status}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center mb-3">
        <div className="rounded-lg bg-slate-50 py-2">
          <p className="font-bold text-gray-900 text-sm">{tower.numberOfFloors || '—'}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Floors</p>
        </div>
        <div className="rounded-lg bg-slate-50 py-2">
          <p className="font-bold text-gray-900 text-sm">{tower.numberOfFlats || stats.total || '—'}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Flats</p>
        </div>
        <div className="rounded-lg bg-slate-50 py-2">
          <p className="font-bold text-gray-900 text-sm">{tower.numberOfLifts ?? '—'}</p>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Lifts</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-green-600 font-medium">Available {stats.available || 0}</span>
        <span className="text-orange-600 font-medium">Booked {stats.booked || 0}</span>
        <span className="text-blue-600 font-medium">Sold {sold}</span>
      </div>

      <p className="text-[11px] text-gray-400">
        Possession {tower.possessionDate ? formatDate(tower.possessionDate) : 'TBD'}
      </p>
    </Link>
  )
}
