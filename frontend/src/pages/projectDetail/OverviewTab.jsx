import { Link } from 'react-router-dom'
import { computeActivityEvents, formatDateTime, getInitials, formatPrice, StackedBar, Donut, LegendRow, GaugeBar, PulseTile } from './shared'

const TOWER_STATUS_COLORS = {
  Planned: 'bg-gray-100 text-gray-600',
  'Under Construction': 'bg-yellow-100 text-yellow-700',
  Ready: 'bg-green-100 text-green-700',
}

export default function OverviewTab({ id, project, units, towers, leads, deals, bookings, payments, userById, onNavigateTab }) {
  const stats = {
    total: units.length,
    available: units.filter((u) => u.status === 'Available').length,
    reserved: units.filter((u) => u.status === 'Reserved').length,
    booked: units.filter((u) => u.status === 'Booked').length,
    sold: units.filter((u) => u.status === 'Registered').length,
  }
  const occupancyPct = stats.total ? Math.round((stats.sold / stats.total) * 100) : 0
  const revenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
  const collections = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0)
  const pendingAmount = revenue - collections

  const siteVisitsCount = leads.reduce(
    (sum, l) => sum + (l.followUpTasks || []).filter((t) => t.type === 'Site Visit').length,
    0
  )

  const bhkSummary = Object.values(
    units.reduce((acc, u) => {
      const key = u.bhkType || 'Unspecified'
      if (!acc[key]) acc[key] = { type: key, available: 0, booked: 0, sold: 0, total: 0 }
      acc[key].total += 1
      if (u.status === 'Available') acc[key].available += 1
      if (u.status === 'Booked') acc[key].booked += 1
      if (u.status === 'Registered') acc[key].sold += 1
      return acc
    }, {})
  )

  const towerByName = new Map((towers || []).map((t) => [t.name, t]))
  const blockNames = [...new Set([...(project.blocks || []), ...units.map((u) => u.block)])]
  const towerSummary = blockNames.map((name) => {
    const towerUnits = units.filter((u) => u.block === name)
    const real = towerByName.get(name)
    return {
      name,
      floors: real?.numberOfFloors || new Set(towerUnits.map((u) => u.floor)).size,
      total: towerUnits.length,
      available: towerUnits.filter((u) => u.status === 'Available').length,
      booked: towerUnits.filter((u) => u.status === 'Booked').length,
      sold: towerUnits.filter((u) => u.status === 'Registered').length,
      status: real?.status,
    }
  })

  const recentEvents = computeActivityEvents(units, bookings, payments, userById, 8)

  const collectedPct = revenue ? Math.round((collections / revenue) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Project snapshot */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Project Snapshot</h3>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex items-center gap-4">
            <Donut
              size={110}
              segments={[
                { value: stats.available, color: '#4ade80' },
                { value: stats.reserved, color: '#fde047' },
                { value: stats.booked, color: '#fb923c' },
                { value: stats.sold, color: '#60a5fa' },
              ]}
              centerLabel={stats.total}
              centerSub="Total Units"
            />
            <div className="flex-1 space-y-1.5">
              <LegendRow color="bg-green-400" label="Available" value={stats.available} />
              <LegendRow color="bg-yellow-400" label="Reserved" value={stats.reserved} />
              <LegendRow color="bg-orange-400" label="Booked" value={stats.booked} />
              <LegendRow color="bg-blue-400" label="Sold" value={stats.sold} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 content-start">
            <PulseTile icon="🎯" label="Leads" value={leads.length} to={`/leads?project=${id}`} />
            <PulseTile icon="🤝" label="Deals" value={deals.length} tone="bg-purple-50 border-purple-100 text-purple-700" to={`/deals?project=${id}`} />
            <PulseTile icon="🚗" label="Site Visits" value={siteVisitsCount} tone="bg-amber-50 border-amber-100 text-amber-700" to={`/visits/calendar?project=${id}`} />
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

      {/* Inventory summary by BHK */}
      {bhkSummary.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Inventory Summary</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bhkSummary.map((row) => (
              <div key={row.type} className="rounded-xl border border-gray-100 p-3">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-medium text-gray-800 text-sm">{row.type}</span>
                  <span className="text-xs text-gray-400">{row.total} total</span>
                </div>
                <StackedBar
                  segments={[
                    { value: row.available, color: 'bg-green-400', label: 'Available' },
                    { value: row.booked, color: 'bg-orange-400', label: 'Booked' },
                    { value: row.sold, color: 'bg-blue-400', label: 'Sold' },
                    { value: row.total - row.available - row.booked - row.sold, color: 'bg-yellow-300', label: 'Reserved' },
                  ]}
                  total={row.total}
                />
                <div className="flex items-center gap-3 mt-2 text-[11px]">
                  <span className="flex items-center gap-1 text-green-600"><span className="h-1.5 w-1.5 rounded-full bg-green-400" />{row.available}</span>
                  <span className="flex items-center gap-1 text-orange-600"><span className="h-1.5 w-1.5 rounded-full bg-orange-400" />{row.booked}</span>
                  <span className="flex items-center gap-1 text-blue-600"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" />{row.sold}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tower summary */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">🏢 Tower Summary</h3>
          <button type="button" onClick={() => onNavigateTab?.('towers')} className="text-xs font-medium text-primary-600 hover:text-primary-700">
            View All →
          </button>
        </div>
        {towerSummary.length === 0 ? (
          <p className="text-sm text-gray-400">No towers added yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {towerSummary.map((t) => (
              <Link
                key={t.name}
                to={`/projects/${id}/blocks/${encodeURIComponent(t.name)}`}
                className="rounded-xl border border-gray-100 p-3 block hover:border-primary-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800 text-sm">Tower {t.name}</span>
                  {t.status ? (
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${TOWER_STATUS_COLORS[t.status] || 'bg-gray-100 text-gray-600'}`}>{t.status}</span>
                  ) : null}
                </div>
                <StackedBar
                  segments={[
                    { value: t.available, color: 'bg-green-400', label: 'Available' },
                    { value: t.booked, color: 'bg-orange-400', label: 'Booked' },
                    { value: t.sold, color: 'bg-blue-400', label: 'Sold' },
                    { value: t.total - t.available - t.booked - t.sold, color: 'bg-yellow-300', label: 'Reserved' },
                  ]}
                  total={t.total}
                />
                <div className="flex items-center justify-between mt-2 text-[11px] text-gray-500">
                  <span>{t.floors || '—'} floors · {t.total} units</span>
                  <span className="text-green-600 font-medium">{t.available} avail</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent activity */}
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
