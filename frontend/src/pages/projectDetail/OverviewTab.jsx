import { computeActivityEvents, formatDateTime, getInitials, Donut, LegendRow, GaugeBar, PulseTile, formatPrice } from './shared'

export default function OverviewTab({
  units, project, bookings, payments, userById,
  stats, todaysLeads, siteVisitsToday, pendingFollowUps, revenue, collections, pendingAmount, occupancyPct,
  onNavigateTab,
}) {
  const collectedPct = revenue ? Math.round((collections / revenue) * 100) : 0

  const blockNames = [...new Set([...(project.blocks || []), ...units.map((u) => u.block)])]
  const towerCount = blockNames.length
  const avgSoldPct = stats.total ? Math.round(((stats.booked + stats.registered) / stats.total) * 100) : 0

  const recentEvents = computeActivityEvents(units, bookings, payments, userById, 5)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Project Snapshot</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex items-center gap-4">
            <Donut
              size={100}
              segments={[
                { value: stats.available, color: '#4ade80' },
                { value: stats.reserved, color: '#facc15' },
                { value: stats.booked, color: '#fb923c' },
                { value: stats.registered, color: '#60a5fa' },
              ]}
              centerLabel={stats.total}
              centerSub="Units"
            />
            <div className="flex-1 space-y-1.5">
              <LegendRow color="bg-green-400" label="Available" value={stats.available} />
              <LegendRow color="bg-yellow-400" label="Reserved" value={stats.reserved} />
              <LegendRow color="bg-orange-400" label="Booked" value={stats.booked} />
              <LegendRow color="bg-blue-400" label="Sold" value={stats.registered} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <PulseTile icon="🎯" label="Leads Today" value={todaysLeads} />
            <PulseTile icon="🚗" label="Site Visits" value={siteVisitsToday} />
            <PulseTile icon="📞" label="Follow-ups" value={pendingFollowUps} tone="bg-amber-50 border-amber-100 text-amber-700" />
          </div>

          <div className="space-y-3">
            <GaugeBar label="Occupancy" pct={occupancyPct} color="bg-blue-500" icon="🏠" />
            <div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>💰 Revenue Collected</span>
                <span className="font-semibold text-gray-800">{collectedPct}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-orange-100 overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${collectedPct}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                {formatPrice(collections) || '₹0'} of {formatPrice(revenue) || '₹0'} · Pending {formatPrice(pendingAmount) || '₹0'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onNavigateTab?.('towers')}
        className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center justify-between hover:border-primary-200 transition-colors text-left"
      >
        <div>
          <h3 className="text-sm font-semibold text-gray-700">🏢 Tower Summary</h3>
          <p className="text-xs text-gray-500 mt-1">{towerCount} tower{towerCount !== 1 ? 's' : ''} · {stats.total} total flats · {avgSoldPct}% sold/booked</p>
        </div>
        <span className="text-xs font-medium text-primary-600 shrink-0">View Towers →</span>
      </button>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Recent Activity</h3>
          <button type="button" onClick={() => onNavigateTab?.('activity')} className="text-xs font-medium text-primary-600 hover:text-primary-700">
            View All →
          </button>
        </div>
        {recentEvents.length === 0 ? (
          <p className="text-sm text-gray-400">No activity recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {recentEvents.map((e, i) => (
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
    </div>
  )
}
