import { Router } from "express";
import multer from "multer";
import {
  createMaterial,
  deleteMaterial,
  getMaterials,
  updateMaterial,
} from "../controllers/materialController";
import path from "path";

const router = Router({ mergeParams: true });

// Multer configuration
const upload = multer({
  dest: path.join(process.cwd(), "uploads_temp"), // Temporary storage
  limits: {
    fileSize: 30 * 1024 * 1024, // 30 MB
  },
  fileFilter: (req, file, cb) => {
    // Supported formats: .pdf, .docx, .txt, .png, .jpg, .jpeg, .gif, .mp4, .mp3
    const allowedMimeTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "image/png",
      "image/jpeg",
      "image/gif",
      "video/mp4",
      "audio/mpeg",
      "audio/mp3",
    ];

    // Also check extensions to be sure, as mime types can vary
    const allowedExtensions = [
      ".pdf",
      ".docx",
      ".txt",
      ".png",
      ".jpg",
      ".jpeg",
      ".gif",
      ".mp4",
      ".mp3",
    ];

    const ext = path.extname(file.originalname).toLowerCase();

    if (
      allowedMimeTypes.includes(file.mimetype) ||
      allowedExtensions.includes(ext)
    ) {
      cb(null, true);
    } else {
      cb(new Error("Nepodporovaný formát souboru"));
    }
  },
});

const uploadMiddleware = (req: any, res: any, next: any) => {
  upload.single("file")(req, res, (err: any) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            message: "Soubor je příliš velký, (max. 30 MB)",
          });
        }
        return res.status(400).json({ message: err.message });
      }
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.get("/", getMaterials);
router.post("/", uploadMiddleware, createMaterial);
router.put("/:materialId", uploadMiddleware, updateMaterial);
router.delete("/:materialId", deleteMaterial);

export default router;
