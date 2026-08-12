import { useEffect, useState } from 'react'
import { getPartnerInventory } from '../../api/partnerApi'
import { recommendInventory } from '../../api/aiApi'

export default function PartnerInventoryPage() {
  const [units, setUnits] = useState([])
  const [loading, setLoading] = useState(true)
  const [recommendation, setRecommendation] = useState('')
  const [recommending, setRecommending] = useState(false)

  useEffect(() => {
    getPartnerInventory().then(setUnits).finally(() => setLoading(false))
  }, [])

  const handleRecommend = async () => {
    setRecommending(true)
    try {
      const { recommendation } = await recommendInventory()
      setRecommendation(recommendation)
    } catch {
      setRecommendation('Could not get a recommendation right now.')
    } finally {
      setRecommending(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">Units currently available across all projects.</p>
        </div>
        <button
          onClick={handleRecommend}
          disabled={recommending}
          className="text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {recommending ? 'Thinking…' : '✨ Recommend Inventory (AI)'}
        </button>
      </div>

      {recommendation && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <p className="text-xs font-semibold text-amber-600 mb-2">Simulated AI response (Phase 1)</p>
          <p className="text-sm text-gray-700">{recommendation}</p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 uppercase tracking-wide bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Project</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">BHK</th>
                <th className="px-4 py-3">Carpet Area</th>
                <th className="px-4 py-3">Base Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">Loading...</td></tr>
              ) : units.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No available units</td></tr>
              ) : (
                units.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 font-medium">{u.project?.name || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{u.block ? `${u.block}-${u.unitNo}` : u.unitNo}</td>
                    <td className="px-4 py-3 text-gray-600">{u.bhkType || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{u.carpetArea ? `${u.carpetArea} sq.ft` : '-'}</td>
                    <td className="px-4 py-3 text-gray-700 font-semibold">{u.basePrice ? `₹${(u.basePrice / 100000).toFixed(1)}L` : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
