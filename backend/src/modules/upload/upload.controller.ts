import type { Request, Response, NextFunction } from "express";
import fs from "fs";

export async function uploadImagesController(req: Request, res: Response, next: NextFunction) {
  try {
    const files = req.files as Express.Multer.File[] | undefined;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "NO_FILES_PROVIDED",
          message: "No files provided for upload"
        }
      });
    }

    // Verify all files exist before returning
    const imageUrls = files.map((file) => {
      if (!fs.existsSync(file.path)) {
        console.error(`WARNING: File not found on disk: ${file.path}`);
      }
      return `/uploads/${file.filename}`;
    });

    return res.status(200).json({
      success: true,
      data: {
        imageUrls
      }
    });
  } catch (error) {
    console.error("Upload error:", error instanceof Error ? error.message : String(error));
    
    return res.status(500).json({
      success: false,
      error: {
        code: "UPLOAD_FAILED",
        message: error instanceof Error ? error.message : "Failed to upload images"
      }
    });
  }
}
