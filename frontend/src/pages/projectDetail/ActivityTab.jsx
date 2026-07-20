import { computeActivityEvents, formatDateTime, getInitials } from './shared'

export default function ActivityTab({ units, bookings, payments, userById }) {
  const events = computeActivityEvents(units, bookings, payments, userById, 30)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h3>
      {events.length === 0 ? (
        <p className="text-sm text-gray-400">No activity recorded yet.</p>
      ) : (
        <div className="space-y-3">
          {events.map((e, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="h-7 w-7 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                {getInitials(e.actor?.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-gray-800">{e.text}</p>
                {e.actor?.name && <p className="text-xs text-gray-400 mt-0.5">by {e.actor.name}</p>}
              </div>
              <span className="text-xs text-gray-400 shrink-0">{formatDateTime(e.date)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
