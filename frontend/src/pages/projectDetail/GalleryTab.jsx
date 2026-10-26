import { useState, useEffect, useCallback } from 'react'
import {
  EditModal, EditPencilButton, Field, inputCls, SingleFileField, FileCollectionField, useFileCollection, useProjectSave, buildFormData,
} from './editShared'

const isPdf = (src) => /\.pdf($|\?)/i.test(src)

function Lightbox({ title, items, index, onClose, onChange }) {
  const count = items.length
  const prev = useCallback(() => onChange((index - 1 + count) % count), [index, count, onChange])
  const next = useCallback(() => onChange((index + 1) % count), [index, count, onChange])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
    }
  }, [onClose, prev, next])

  const navBtn = 'absolute top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white/10 text-3xl text-white hover:bg-white/25 flex items-center justify-center'

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center" onClick={onClose}>
      <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-3 text-white">
        <span className="text-sm">{title} · {index + 1} / {count}</span>
        <button type="button" onClick={onClose} className="h-10 w-10 rounded-full text-2xl hover:bg-white/15" aria-label="Close">✕</button>
      </div>
      <img
        src={items[index]}
        alt={`${title} ${index + 1}`}
        className="max-h-[90vh] max-w-[95vw] object-contain select-none"
        onClick={(e) => e.stopPropagation()}
      />
      {count > 1 && (
        <>
          <button type="button" onClick={(e) => { e.stopPropagation(); prev() }} className={`${navBtn} left-4`} aria-label="Previous">‹</button>
          <button type="button" onClick={(e) => { e.stopPropagation(); next() }} className={`${navBtn} right-4`} aria-label="Next">›</button>
        </>
      )}
    </div>
  )
}

function MediaGrid({ title, items, type }) {
  const [openIndex, setOpenIndex] = useState(null)
  if (!items || items.length === 0) return null
  // PDFs (e.g. a master plan) can't render in an <img>, so they open in a new tab instead.
  const viewable = items.filter((src) => !isPdf(src))
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
      <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((src, index) => (
          <div key={`${title}-${index}`} className="overflow-hidden rounded-2xl border border-gray-200 bg-slate-50">
            {type === 'video' ? (
              <video src={src} controls preload="metadata" className="h-56 w-full bg-black object-cover" />
            ) : isPdf(src) ? (
              <a href={src} target="_blank" rel="noreferrer" className="flex h-56 w-full items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-700">
                📄 Open PDF →
              </a>
            ) : (
              <button type="button" onClick={() => setOpenIndex(viewable.indexOf(src))} className="block w-full cursor-zoom-in">
                <img src={src} alt={`${title} ${index + 1}`} className="h-56 w-full object-cover transition hover:opacity-90" loading="lazy" />
              </button>
            )}
          </div>
        ))}
      </div>
      {openIndex !== null && (
        <Lightbox title={title} items={viewable} index={openIndex} onClose={() => setOpenIndex(null)} onChange={setOpenIndex} />
      )}
    </div>
  )
}

function EditGalleryModal({ id, project, onClose, onSaved }) {
  const { save, saving, error } = useProjectSave(id, onSaved)
  const imagesCollection = useFileCollection(project.images || [])
  const videosCollection = useFileCollection(project.videos || [])
  const floorPlansCollection = useFileCollection(project.floorPlanImages || [])
  const constructionCollection = useFileCollection(project.constructionProgressPhotos || [])
  const [masterPlanFile, setMasterPlanFile] = useState(null)
  const [virtualTourLink, setVirtualTourLink] = useState(project.virtualTourLink || '')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fd = buildFormData(
      {
        images: JSON.stringify(imagesCollection.kept),
        videos: JSON.stringify(videosCollection.kept),
        floorPlanImages: JSON.stringify(floorPlansCollection.kept),
        constructionProgressPhotos: JSON.stringify(constructionCollection.kept),
        virtualTourLink,
      },
      {
        images: imagesCollection.added.map((item) => item.file),
        videos: videosCollection.added.map((item) => item.file),
        floorPlanImages: floorPlansCollection.added.map((item) => item.file),
        constructionProgressPhotos: constructionCollection.added.map((item) => item.file),
        masterPlanImage: masterPlanFile,
      }
    )
    const ok = await save(fd, { multipart: true })
    if (ok) onClose()
  }

  return (
    <EditModal title="Gallery" icon="🖼" onClose={onClose} onSubmit={handleSubmit} saving={saving} error={error} wide>
      <FileCollectionField label="Images" collection={imagesCollection} accept="image/*" hint="Up to 8 images" />
      <FileCollectionField label="Videos" collection={videosCollection} accept="video/*" hint="Up to 4 videos" previewAs="file" />
      <FileCollectionField label="Floor Plans" collection={floorPlansCollection} accept="image/*" hint="Up to 8 images" />
      <FileCollectionField label="Construction Progress Photos" collection={constructionCollection} accept="image/*" hint="Up to 12 images" />
      <SingleFileField label="Master Plan" currentUrl={project.masterPlanImage} file={masterPlanFile} onPick={setMasterPlanFile} accept="image/*,application/pdf" />
      <Field label="360° Virtual Tour Link">
        <input value={virtualTourLink} onChange={(e) => setVirtualTourLink(e.target.value)} className={inputCls} placeholder="https://..." />
      </Field>
    </EditModal>
  )
}

export default function GalleryTab({ id, project, onProjectChanged }) {
  const [editing, setEditing] = useState(false)
  const images = Array.isArray(project.images) ? project.images.filter(Boolean) : []
  const videos = Array.isArray(project.videos) ? project.videos.filter(Boolean) : []
  const floorPlans = Array.isArray(project.floorPlanImages) ? project.floorPlanImages.filter(Boolean) : []
  const constructionPhotos = Array.isArray(project.constructionProgressPhotos) ? project.constructionProgressPhotos.filter(Boolean) : []
  const hasAny = images.length || videos.length || floorPlans.length || constructionPhotos.length || project.masterPlanImage || project.virtualTourLink

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <EditPencilButton onClick={() => setEditing(true)} label="Edit Gallery" />
      </div>

      {!hasAny ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
          No gallery media added yet.
        </div>
      ) : (
        <>
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
        </>
      )}

      {editing && <EditGalleryModal id={id} project={project} onClose={() => setEditing(false)} onSaved={onProjectChanged} />}
    </div>
  )
}
