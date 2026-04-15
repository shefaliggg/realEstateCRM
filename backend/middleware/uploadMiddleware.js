const fs = require('fs')
const path = require('path')
const multer = require('multer')

const uploadRoot = path.join(__dirname, '..', 'uploads', 'project-images')

fs.mkdirSync(uploadRoot, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadRoot)
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || '').toLowerCase()
    const safeName = path.basename(file.originalname || 'project-image', extension)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    cb(null, `${Date.now()}-${safeName || 'project-image'}${extension}`)
  },
})

const fileFilter = (_req, file, cb) => {
  if (file.mimetype?.startsWith('image/') || file.mimetype?.startsWith('video/')) {
    cb(null, true)
    return
  }

  cb(new Error('Only image and video uploads are allowed'))
}

const projectImageUpload = multer({
  storage,
  fileFilter,
  limits: {
    files: 12,
    fileSize: 25 * 1024 * 1024,
  },
})

module.exports = { projectImageUpload }