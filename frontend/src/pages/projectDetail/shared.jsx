export function Donut({ segments, size = 108, centerLabel, centerSub }) {
  const total = segments.reduce((sum, seg) => sum + (seg.value || 0), 0)
  let cumulative = 0
  const stops = total > 0
    ? segments.map((seg) => {
      const start = (cumulative / total) * 360
      cumulative += seg.value || 0
      const end = (cumulative / total) * 360
      return `${seg.color} ${start}deg ${end}deg`
    }).join(', ')
    : '#e5e7eb 0deg 360deg'
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div className="h-full w-full rounded-full" style={{ background: `conic-gradient(${stops})` }} />
      <div className="absolute inset-[16%] rounded-full bg-white flex flex-col items-center justify-center text-center">
        <p className="text-lg font-bold text-gray-900 leading-none">{centerLabel}</p>
        {centerSub && <p className="text-[10px] text-gray-500 mt-1">{centerSub}</p>}
      </div>
    </div>
  )
}

export function LegendRow({ color, label, value }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-600">
      <span className={`h-2 w-2 rounded-full shrink-0 ${color}`} />
      <span className="flex-1">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  )
}

export function GaugeBar({ label, pct, color = 'bg-primary-500', icon, hint }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
        <span>{icon} {label}</span>
        <span className="font-semibold text-gray-800">{pct === null || pct === undefined ? '—' : `${pct}%`}</span>
      </div>
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct || 0}%` }} />
      </div>
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export function PulseTile({ icon, label, value, tone = 'bg-primary-50 border-primary-100 text-primary-700' }) {
  return (
    <div className={`rounded-xl border p-3 text-center ${tone}`}>
      <p className="text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1.5 text-[10px] font-medium uppercase tracking-wide opacity-80">{icon} {label}</p>
    </div>
  )
}

export function KpiCard({ label, value, tone = 'text-gray-900', hint }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {hint && <p className="text-[10px] text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}

export function amenityIcon(name) {
  const n = name.toLowerCase()
  if (n.includes('pool')) return '🏊'
  if (n.includes('gym')) return '🏋️'
  if (n.includes('club')) return '🏛️'
  if (n.includes('indoor game')) return '🎮'
  if (n.includes('outdoor sport')) return '🏸'
  if (n.includes('jogging') || n.includes('track')) return '🏃'
  if (n.includes('play')) return '🧒'
  if (n.includes('multipurpose') || n.includes('hall')) return '🏢'
  if (n.includes('power backup')) return '🔋'
  if (n.includes('lift')) return '🛗'
  if (n.includes('cctv') || n.includes('security')) return '🛡️'
  if (n.includes('parking')) return '🅿️'
  if (n.includes('ev charg')) return '🔌'
  if (n.includes('garden') || n.includes('landscape')) return '🌳'
  if (n.includes('temple')) return '🛕'
  if (n.includes('market')) return '🛒'
  if (n.includes('pharmacy')) return '💊'
  if (n.includes('basketball')) return '🏀'
  if (n.includes('tennis')) return '🎾'
  if (n.includes('yoga')) return '🧘'
  return '✨'
}

export function formatPrice(v) {
  const n = Number(v)
  if (!n) return ''
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(n % 10000000 === 0 ? 0 : 2)} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(n % 100000 === 0 ? 0 : 1)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

export function formatDate(value) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '—'
  return parsed.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function getInitials(name) {
  return name
    ? name.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase()
    : 'U'
}

export function daysBetween(from, to) {
  const a = new Date(from)
  const b = new Date(to)
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null
  return Math.round((b - a) / (1000 * 60 * 60 * 24))
}

export function computeActivityEvents(units, bookings, payments, userById, limit = 30) {
  const unitEvents = units.flatMap((u) =>
    (u.statusHistory || []).map((h) => ({
      date: h.changedAt,
      text: `Unit ${u.unitNo}${u.block ? ` (Block ${u.block})` : ''} marked ${h.status}${h.note ? ` — ${h.note}` : ''}`,
      actor: userById.get(h.changedBy) || userById.get(h.changedBy?._id),
    }))
  )

  const bookingEvents = bookings.map((b) => ({
    date: b.createdAt,
    text: `Booking created for ${b.customer?.name || 'a customer'}${b.unit ? ` — Unit ${b.unit.block}-${b.unit.unitNo}` : ''} (${formatPrice(b.totalAmount)})`,
    actor: b.bookedBy,
  }))

  const paymentEvents = payments.map((p) => ({
    date: p.date || p.createdAt,
    text: `Payment received ${formatPrice(p.amount)}${p.booking?.customer?.name ? ` from ${p.booking.customer.name}` : ''}`,
    actor: p.recordedBy || userById.get(p.recordedBy),
  }))

  return [...unitEvents, ...bookingEvents, ...paymentEvents]
    .filter((e) => e.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit)
}
