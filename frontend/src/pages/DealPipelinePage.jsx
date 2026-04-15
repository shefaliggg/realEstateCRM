import { useState } from 'react'
import { Link } from 'react-router-dom'

const MOCK_DEALS = [
  { id: 1, name: 'Skyline Residency - 2BHK', lead: 'Ankit Joshi', value: 5000000, probability: 75 },
  { id: 2, name: 'Green Valley Villa - 3BHK', lead: 'Seema Patel', value: 8500000, probability: 60 },
  { id: 3, name: 'Corporate Park', lead: 'Rohit Das', value: 22000000, probability: 85 },
  { id: 4, name: 'Urban Homes - Penthouse 4BHK', lead: 'Neha Reddy', value: 15000000, probability: 100 },
  { id: 5, name: 'Metro Heights - Plot Sale', lead: 'Vikram Kapoor', value: 3800000, probability: 30 },
]

const DEAL_STAGES = {
  'Lead Qualification': [MOCK_DEALS[4]],
  'Needs Analysis': [],
  'Proposal Sent': [MOCK_DEALS[0]],
  'Negotiation': [MOCK_DEALS[1]],
  'Contract Review': [MOCK_DEALS[2]],
  'Won': [MOCK_DEALS[3]],
  'Lost': [],
}

export default function DealPipelinePage() {
  const [deals, setDeals] = useState(DEAL_STAGES)
  const [draggedDeal, setDraggedDeal] = useState(null)
  const [sourceStage, setSourceStage] = useState(null)

  function handleDragStart(deal, stage) {
    setDraggedDeal(deal)
    setSourceStage(stage)
  }

  function handleDragOver(e) {
    e.preventDefault()
  }

  function handleDrop(targetStage) {
    if (!draggedDeal || !sourceStage) return

    setDeals((prev) => {
      const updated = { ...prev }
      updated[sourceStage] = updated[sourceStage].filter((d) => d.id !== draggedDeal.id)
      updated[targetStage] = [...updated[targetStage], draggedDeal]
      return updated
    })

    setDraggedDeal(null)
    setSourceStage(null)
  }

  const totalValue = Object.values(deals)
    .flat()
    .reduce((a, d) => a + d.value, 0)

  const stages = Object.keys(deals)

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Pipeline</h2>
        </div>
        <Link
          to="/deals/add"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Deal
        </Link>
      </div>

      {/* Kanban board */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(280px, 1fr))` }}>
        {stages.map((stage) => {
          const stageDeals = deals[stage]
          const stageValue = stageDeals.reduce((a, d) => a + d.value, 0)
          const stageProbability = stageDeals.length > 0 ? Math.round(stageDeals.reduce((a, d) => a + d.probability, 0) / stageDeals.length) : 0

          const stageColors = {
            'Lead Qualification': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', header: 'bg-blue-100' },
            'Needs Analysis': { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', header: 'bg-cyan-100' },
            'Proposal Sent': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', header: 'bg-amber-100' },
            'Negotiation': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', header: 'bg-orange-100' },
            'Contract Review': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', header: 'bg-purple-100' },
            'Won': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', header: 'bg-green-100' },
            'Lost': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', header: 'bg-red-100' },
          }

          const colors = stageColors[stage] || stageColors['Lead Qualification']

          return (
            <div
              key={stage}
              className={`${colors.bg} border-2 ${colors.border} rounded-xl flex flex-col max-h-96`}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage)}
            >
              {/* Column header */}
              <div className={`${colors.header} px-4 py-3 border-b ${colors.border}`}>
                <p className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>{stage}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-2xl font-bold ${colors.text}`}>{stageDeals.length}</span>
                  <span className={`text-xs font-semibold ${colors.text}`}>{stageProbability}%</span>
                </div>
                <p className={`text-xs ${colors.text} mt-1`}>INR {(stageValue / 1000000).toFixed(1)} Cr</p>
              </div>

              {/* Column content */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {stageDeals.length === 0 ? (
                  <div className={`py-8 text-center ${colors.text} opacity-50`}>
                    <p className="text-xs">No deals</p>
                  </div>
                ) : (
                  stageDeals.map((deal) => (
                    <Link
                      key={deal.id}
                      to={`/deals/${deal.id}`}
                      draggable
                      onDragStart={() => handleDragStart(deal, stage)}
                      className="block bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-primary-300 transition cursor-move group"
                    >
                      <h4 className="text-xs font-bold text-gray-900 leading-tight group-hover:text-primary-600 line-clamp-2">
                        {deal.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1.5">{deal.lead}</p>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                        <span className="text-xs font-semibold text-gray-900">INR {(deal.value / 1000000).toFixed(1)} Cr</span>
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${colors.text} ${colors.header}`}>
                          {deal.probability}%
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-blue-900">Drag and Drop:</p>
            <p className="text-sm text-blue-700 mt-1">
              Drag deal cards between columns to move them through your sales pipeline stages. Probability percentages auto-calculate based on stage.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
