import { Link } from 'react-router-dom'
import TowerCard from './TowerCard'

export default function TowersTab({ id, project, units, towers }) {
  const towerByName = new Map((towers || []).map((t) => [t.name, t]))
  const blockNames = [...new Set([...(project.blocks || []), ...units.map((u) => u.block)])]
  const towerCards = blockNames.map((name) => {
    const real = towerByName.get(name)
    if (real) return real
    const towerUnits = units.filter((u) => u.block === name)
    return {
      name,
      numberOfFloors: new Set(towerUnits.map((u) => u.floor)).size,
      unitStats: {
        total: towerUnits.length,
        available: towerUnits.filter((u) => u.status === 'Available').length,
        booked: towerUnits.filter((u) => u.status === 'Booked').length,
        registered: towerUnits.filter((u) => u.status === 'Registered').length,
      },
    }
  })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Link
          to={`/projects/${id}/towers/add`}
          className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
        >
          + Add Tower
        </Link>
      </div>

      {towerCards.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
          No towers added yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {towerCards.map((tower) => (
            <TowerCard key={tower.name} id={id} tower={tower} />
          ))}
        </div>
      )}
    </div>
  )
}
