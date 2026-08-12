import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import api from '../api/axios'

function toDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function monthLabel(date) {
  return date.toLocaleDateString([], { month: 'long', year: 'numeric' })
}

export default function SiteVisitCalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const projectFilter = searchParams.get('project') || ''
  const [projectName, setProjectName] = useState('')
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedKey, setSelectedKey] = useState(() => toDateKey(new Date()))

  useEffect(() => {
    setLoading(true)
    api.get(projectFilter ? `/leads?project=${projectFilter}` : '/leads')
      .then((res) => setLeads(res.data || []))
      .catch(() => setError('Failed to load visit calendar'))
      .finally(() => setLoading(false))
  }, [projectFilter])

  useEffect(() => {
    if (!projectFilter) { setProjectName(''); return }
    api.get(`/projects/${projectFilter}`).then((r) => setProjectName(r.data?.name || '')).catch(() => {})
  }, [projectFilter])

  const clearProjectFilter = () => {
    const next = new URLSearchParams(searchParams)
    next.delete('project')
    setSearchParams(next)
  }

  const visits = useMemo(() => {
    const rows = []
    leads.forEach((lead) => {
      ;(lead.followUpTasks || []).forEach((task) => {
        if (task.type !== 'Site Visit' || !task.dueDate) return
        const due = new Date(task.dueDate)
        if (Number.isNaN(due.getTime())) return
        rows.push({
          leadId: lead._id,
          leadName: lead.name,
          taskId: task._id,
          dueDate: due,
          completed: Boolean(task.completed),
          note: task.note || '',
        })
      })
    })
    return rows.sort((a, b) => a.dueDate - b.dueDate)
  }, [leads])

  const visitsByDay = useMemo(() => {
    const map = new Map()
    visits.forEach((visit) => {
      const key = toDateKey(visit.dueDate)
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(visit)
    })
    return map
  }, [visits])

  const monthCells = useMemo(() => {
    const start = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1)
    const end = new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 0)
    const leading = start.getDay()

    const cells = []
    for (let i = 0; i < leading; i += 1) cells.push(null)
    for (let day = 1; day <= end.getDate(); day += 1) {
      cells.push(new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day))
    }
    while (cells.length % 7 !== 0) cells.push(null)

    return cells
  }, [monthCursor])

  const selectedVisits = visitsByDay.get(selectedKey) || []

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Visit Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">Month-wise view of all scheduled lead visits.</p>
        </div>
        <Link
          to="/visits/schedule"
          className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          Schedule Visit
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

      {projectFilter && (
        <div className="flex items-center gap-2 bg-primary-50 border border-primary-100 text-primary-700 rounded-lg px-4 py-2.5 text-sm">
          <span>Filtered by project{projectName ? `: ${projectName}` : ''}</span>
          <button onClick={clearProjectFilter} className="ml-auto text-xs font-medium underline hover:text-primary-800">Clear filter</button>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Previous
            </button>
            <h2 className="text-lg font-semibold text-gray-900">{monthLabel(monthCursor)}</h2>
            <button
              type="button"
              onClick={() => setMonthCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Next
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2 text-xs font-semibold text-gray-500 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {monthCells.map((date, idx) => {
              if (!date) {
                return <div key={`blank-${idx}`} className="h-24 rounded-lg bg-gray-50" />
              }

              const key = toDateKey(date)
              const dayVisits = visitsByDay.get(key) || []
              const active = key === selectedKey

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  className={`h-24 rounded-lg border text-left p-2 transition-colors ${active ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <div className="text-xs font-semibold text-gray-700">{date.getDate()}</div>
                  <div className="mt-2 space-y-1">
                    {dayVisits.slice(0, 2).map((visit) => (
                      <div
                        key={visit.taskId}
                        className={`text-[10px] px-1.5 py-0.5 rounded ${visit.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                      >
                        {visit.leadName}
                      </div>
                    ))}
                    {dayVisits.length > 2 && (
                      <div className="text-[10px] text-gray-500">+{dayVisits.length - 2} more</div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-semibold text-gray-800 mb-1">Visits on {selectedKey}</h3>
          <p className="text-xs text-gray-500 mb-4">{selectedVisits.length} visit{selectedVisits.length !== 1 ? 's' : ''}</p>

          {loading ? (
            <div className="text-sm text-gray-400">Loading visits...</div>
          ) : selectedVisits.length === 0 ? (
            <div className="text-sm text-gray-400">No visits for this day.</div>
          ) : (
            <div className="space-y-3">
              {selectedVisits.map((visit) => (
                <div key={visit.taskId} className="rounded-lg border border-gray-100 p-3">
                  <Link to={`/leads/${visit.leadId}`} className="text-sm font-semibold text-gray-900 hover:text-primary-600">
                    {visit.leadName}
                  </Link>
                  <p className="text-xs text-gray-500 mt-1">
                    {visit.dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {visit.note && <p className="text-xs text-gray-600 mt-2">{visit.note}</p>}
                  <span className={`mt-2 inline-flex text-xs px-2 py-0.5 rounded-full ${visit.completed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {visit.completed ? 'Completed' : 'Scheduled'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
