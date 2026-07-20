import { formatPrice } from './shared'

export default function ReportsTab({ project, units, towers }) {
  const configSummary = Object.values(
    units.reduce((acc, u) => {
      const key = u.bhkType || 'Unspecified'
      if (!acc[key]) acc[key] = { type: key, available: 0, sold: 0, total: 0 }
      acc[key].total += 1
      if (u.status === 'Available') acc[key].available += 1
      if (u.status === 'Registered') acc[key].sold += 1
      return acc
    }, {})
  )

  const unitConfigurations = project.unitConfigurations || []

  const towerByName = new Map((towers || []).map((t) => [t.name, t]))
  const blockNames = [...new Set([...(project.blocks || []), ...units.map((u) => u.block)])]
  const towerPerformance = blockNames.map((name) => {
    const towerUnits = units.filter((u) => u.block === name)
    const total = towerUnits.length
    const sold = towerUnits.filter((u) => u.status === 'Registered').length
    const booked = towerUnits.filter((u) => u.status === 'Booked').length
    const available = towerUnits.filter((u) => u.status === 'Available').length
    const pct = total ? Math.round(((sold + booked) / total) * 100) : 0
    return { name, total, sold, booked, available, pct, status: towerByName.get(name)?.status }
  })

  return (
    <div className="space-y-4">
      {configSummary.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3">🛏 Configuration Summary <span className="text-xs font-normal text-gray-400">(from actual units)</span></h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Available</th>
                  <th className="py-2 pr-4">Sold</th>
                  <th className="py-2 pr-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {configSummary.map((row) => (
                  <tr key={row.type} className="border-b border-gray-50">
                    <td className="py-2 pr-4 font-medium text-gray-800">{row.type}</td>
                    <td className="py-2 pr-4 text-green-600 font-medium">{row.available}</td>
                    <td className="py-2 pr-4 text-blue-600 font-medium">{row.sold}</td>
                    <td className="py-2 pr-4 text-gray-600">{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {unitConfigurations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3">🛏 Planned Configuration <span className="text-xs font-normal text-gray-400">(from project setup)</span></h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-4">BHK</th>
                  <th className="py-2 pr-4">Units</th>
                  <th className="py-2 pr-4">Area Range</th>
                  <th className="py-2 pr-4">Starting Price</th>
                </tr>
              </thead>
              <tbody>
                {unitConfigurations.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2 pr-4 font-medium text-gray-800">{row.bhk}</td>
                    <td className="py-2 pr-4 text-gray-600">{row.units ?? '—'}</td>
                    <td className="py-2 pr-4 text-gray-600">{row.areaFrom && row.areaTo ? `${row.areaFrom} - ${row.areaTo} sqft` : '—'}</td>
                    <td className="py-2 pr-4 text-gray-600">{row.startingPrice ? formatPrice(row.startingPrice) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {towerPerformance.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <h3 className="font-semibold text-gray-800 mb-3">🏢 Tower-wise Performance</h3>
          <div className="space-y-3">
            {towerPerformance.map((t) => (
              <div key={t.name}>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span className="font-medium text-gray-700">Tower {t.name}</span>
                  <span>{t.total} units · {t.pct}% sold/booked</span>
                </div>
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full bg-primary-500" style={{ width: `${t.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
