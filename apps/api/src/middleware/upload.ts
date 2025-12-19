import multer from "multer";
import path from "path";

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
  'text/plain',
  // Images
  'image/png',
  'image/jpeg',
  'image/gif',
  // Video
  'video/mp4',
  // Audio
  'audio/mpeg', // .mp3
];

// Allowed extensions
const ALLOWED_EXTENSIONS = [
  '.pdf', '.docx', '.txt',
  '.png', '.jpg', '.jpeg', '.gif',
  '.mp4', '.mp3'
];

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const ext = path.extname(file.originalname).toLowerCase();
  
  // Check both extension and MIME type
  if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('Unsupported file format'));
  }
  
  cb(null, true);
};

// Use memory storage to access file buffer
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 30 * 1024 * 1024 // 30MB
  },
  fileFilter: fileFilter
});
