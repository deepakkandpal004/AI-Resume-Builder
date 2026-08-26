import multer from "multer"

const ALLOWED = new Set(["image/png", "image/jpeg", "image/jpg", "image/webp"])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(Object.assign(new Error("Only JPEG, PNG or WebP images are allowed"), { status: 400 }))
    }
  }
})

export default upload
