import { useEffect, useState } from 'react'
import { getConstructionUpdates } from '../../api/customerPortalApi'

export default function ConstructionUpdatesPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getConstructionUpdates().then(setData).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Construction Updates</h1>
        <p className="text-sm text-gray-500 mt-1">{data?.projectName || 'Progress photos for your project.'}</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading…</p>
      ) : !data?.photos?.length ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="text-gray-600 font-medium">No construction updates yet</p>
          <p className="text-sm text-gray-400 mt-1">Progress photos will appear here as they're added.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {data.photos.map((url, i) => (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-gray-200 aspect-square">
              <img src={url} alt={`Construction update ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
