function MediaGrid({ title, items, type }) {
  if (!items || items.length === 0) return null
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((src, index) => (
          <div key={`${title}-${index}`} className="overflow-hidden rounded-2xl border border-gray-200 bg-slate-50">
            {type === 'video' ? (
              <video src={src} controls preload="metadata" className="h-56 w-full bg-black object-cover" />
            ) : (
              <img src={src} alt={`${title} ${index + 1}`} className="h-56 w-full object-cover" loading="lazy" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function GalleryTab({ project }) {
  const images = Array.isArray(project.images) ? project.images.filter(Boolean) : []
  const videos = Array.isArray(project.videos) ? project.videos.filter(Boolean) : []
  const floorPlans = Array.isArray(project.floorPlanImages) ? project.floorPlanImages.filter(Boolean) : []
  const constructionPhotos = Array.isArray(project.constructionProgressPhotos) ? project.constructionProgressPhotos.filter(Boolean) : []
  const hasAny = images.length || videos.length || floorPlans.length || constructionPhotos.length || project.masterPlanImage || project.virtualTourLink

  if (!hasAny) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
        No gallery media added yet.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {project.virtualTourLink && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">🧭 360° Virtual Tour</h3>
          <a href={project.virtualTourLink} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Open Tour →
          </a>
        </div>
      )}
      <MediaGrid title="Images" items={images} type="image" />
      <MediaGrid title="Videos" items={videos} type="video" />
      <MediaGrid title="Floor Plans" items={floorPlans} type="image" />
      <MediaGrid title="Construction Progress Photos" items={constructionPhotos} type="image" />
      {project.masterPlanImage && <MediaGrid title="Master Plan" items={[project.masterPlanImage]} type="image" />}
    </div>
  )
}
