import { useState } from 'react'
import api from '../../api/axios'
import { formatDate, formatPrice, KpiCard } from './shared'

function RecordPaymentForm({ booking, nextSchedule, onDone }) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(nextSchedule ? String(nextSchedule.amount) : '')
  const [mode, setMode] = useState('Online')
  const [reference, setReference] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!amount || saving) return
    setSaving(true)
    try {
      await api.post('/payments', {
        project: booking.project,
        booking: booking._id,
        schedule: nextSchedule?._id,
        amount: Number(amount),
        mode,
        reference,
      })
      setOpen(false)
      onDone?.()
    } catch {
      // inline errors intentionally suppressed to keep the row compact
    } finally {
      setSaving(false)
    }
  }

  if (!open) {
    return <button onClick={() => setOpen(true)} className="text-xs font-medium text-primary-600 hover:text-primary-700">Record Payment</button>
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-24 text-xs border border-gray-200 rounded px-1.5 py-1" />
      <select value={mode} onChange={(e) => setMode(e.target.value)} className="text-xs border border-gray-200 rounded px-1.5 py-1">
        {['Online', 'Cheque', 'NEFT', 'IMPS', 'Cash', 'Other'].map((m) => <option key={m}>{m}</option>)}
      </select>
      <input placeholder="Reference" value={reference} onChange={(e) => setReference(e.target.value)} className="w-24 text-xs border border-gray-200 rounded px-1.5 py-1" />
      <button onClick={submit} disabled={saving || !amount} className="text-xs font-medium text-white bg-primary-600 rounded px-2 py-1 disabled:opacity-50">Save</button>
      <button onClick={() => setOpen(false)} className="text-xs text-gray-400">✕</button>
    </div>
  )
}

export default function PaymentsTab({ bookings, schedules, onPaymentsChanged }) {
  const expectedCollection = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0)
  const collected = bookings.reduce((sum, b) => sum + (b.paidAmount || 0), 0)
  const pending = expectedCollection - collected

  const schedulesByBooking = new Map()
  schedules.forEach((s) => {
    const bookingId = s.booking?._id || s.booking
    if (!schedulesByBooking.has(bookingId)) schedulesByBooking.set(bookingId, [])
    schedulesByBooking.get(bookingId).push(s)
  })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <KpiCard label="Expected Collection" value={formatPrice(expectedCollection) || '₹0'} />
        <KpiCard label="Collected" value={formatPrice(collected) || '₹0'} tone="text-green-700" />
        <KpiCard label="Pending" value={formatPrice(pending) || '₹0'} tone="text-orange-600" />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Customer</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Unit</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Paid</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Due</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Next Due</th>
                <th className="text-left px-2 py-3 font-semibold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {bookings.map((b) => {
                const bookingSchedules = (schedulesByBooking.get(b._id) || [])
                  .filter((s) => s.status !== 'Paid')
                  .sort((x, y) => new Date(x.dueDate) - new Date(y.dueDate))
                const nextSchedule = bookingSchedules[0]
                const due = (b.totalAmount || 0) - (b.paidAmount || 0)
                return (
                  <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{b.customer?.name || '—'}</td>
                    <td className="px-2 py-2.5 text-gray-600">{b.unit ? `${b.unit.block}-${b.unit.unitNo}` : '—'}</td>
                    <td className="px-2 py-2.5 text-green-600 font-medium">{formatPrice(b.paidAmount) || '₹0'}</td>
                    <td className="px-2 py-2.5 text-orange-600 font-medium">{due > 0 ? formatPrice(due) : '—'}</td>
                    <td className="px-2 py-2.5 text-gray-600">
                      {nextSchedule ? `${nextSchedule.label} · ${formatDate(nextSchedule.dueDate)}` : (due > 0 ? 'Not scheduled' : 'Fully paid')}
                    </td>
                    <td className="px-2 py-2.5">
                      {due > 0 && <RecordPaymentForm booking={b} nextSchedule={nextSchedule} onDone={onPaymentsChanged} />}
                    </td>
                  </tr>
                )
              })}
              {bookings.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400">No bookings to collect payments against yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
