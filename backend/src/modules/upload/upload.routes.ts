import { Router } from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import type { Request, Response, NextFunction } from "express";
import { requireAuth } from "../../middleware/requireAuth.js";
import { uploadImagesController } from "./upload.controller.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (_req: Express.Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, uploadDir);
  },
  filename: (_req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit per file
  }
});

export const uploadRouter = Router();

// Protected route - require authentication
uploadRouter.use(requireAuth);

uploadRouter.post(
  "/",
  // Multer file upload with error handling
  (req: Request, res: Response, next: NextFunction) => {
    upload.array("images", 5)(req, res, (err: any) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              success: false,
              error: {
                code: "FILE_TOO_LARGE",
                message: "File size exceeds 5MB limit"
              }
            });
          }
          if (err.code === "LIMIT_FILE_COUNT") {
            return res.status(400).json({
              success: false,
              error: {
                code: "TOO_MANY_FILES",
                message: "Maximum 5 files allowed"
              }
            });
          }
        }
        return res.status(400).json({
          success: false,
          error: {
            code: "UPLOAD_ERROR",
            message: err.message || "File upload error"
          }
        });
      }
      next();
    });
  },
  uploadImagesController
);
