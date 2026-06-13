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
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Accept only image files
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
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
  // Pre-upload logging
  (req: Request, res: Response, next: NextFunction) => {
    console.log("=== UPLOAD ROUTE PRE-MIDDLEWARE ===");
    console.log("User authenticated:", req.user ? `${req.user.sub}` : "NO");
    console.log("Content-Type:", req.headers["content-type"]);
    console.log("Content-Length:", req.headers["content-length"]);
    console.log("Proceeding to multer...");
    next();
  },
  // Multer file upload
  (req: Request, res: Response, next: NextFunction) => {
    upload.array("images", 5)(req, res, (err) => {
      if (err) {
        console.log("=== MULTER ERROR CAUGHT IN WRAPPER ===");
        console.error("Error type:", err.constructor.name);
        console.error("Error message:", err.message);
        console.error("Error:", err);
        
        if (err instanceof multer.MulterError) {
          console.error("  MulterError code:", err.code);
          console.error("  Field:", err.field);
          
          if (err.code === "FILE_TOO_LARGE") {
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
        } else {
          // Custom file filter errors
          return res.status(400).json({
            success: false,
            error: {
              code: "UPLOAD_ERROR",
              message: err.message || "File upload error"
            }
          });
        }
      }
      next();
    });
  },
  uploadImagesController
);
