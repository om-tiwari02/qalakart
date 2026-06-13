import type { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";

export async function uploadImagesController(req: Request, res: Response, next: NextFunction) {
  try {
    console.log("=== UPLOAD CONTROLLER START ===");
    console.log("Request method:", req.method);
    console.log("Request path:", req.path);
    console.log("Request headers:", req.headers);
    console.log("Has files?", !!req.files);
    console.log("Files count:", Array.isArray(req.files) ? req.files.length : 0);
    
    if (Array.isArray(req.files)) {
      console.log("Files array:");
      req.files.forEach((file, idx) => {
        const fileExists = fs.existsSync(file.path);
        const fileStats = fileExists ? fs.statSync(file.path) : null;
        
        console.log(`  [${idx}]`, {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          filename: file.filename,
          path: file.path,
          destinationPath: file.destination,
          fileExists,
          actualFileSize: fileStats?.size || 0,
          isReadable: fileExists ? fs.accessSync(file.path, fs.constants.R_OK) === undefined : false
        });
      });
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      console.warn("No files in request - returning 400");
      return res.status(400).json({
        success: false,
        error: {
          code: "NO_FILES_PROVIDED",
          message: "No files provided for upload"
        }
      });
    }

    console.log(`Processing ${req.files.length} files`);
    
    // Verify all files exist before returning
    const imageUrls = req.files.map((file) => {
      if (!fs.existsSync(file.path)) {
        console.error(`WARNING: File not found on disk: ${file.path}`);
      }
      const url = `/uploads/${file.filename}`;
      console.log(`  Processed: ${file.originalname} -> ${url}`);
      return url;
    });

    console.log("Upload successful, sending response with URLs:", imageUrls);
    console.log("=== UPLOAD CONTROLLER END ===");
    
    return res.status(200).json({
      success: true,
      data: {
        imageUrls
      }
    });
  } catch (error) {
    console.error("=== UPLOAD CONTROLLER ERROR ===");
    console.error("Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("Error message:", error instanceof Error ? error.message : String(error));
    console.error("Full error:", error);
    console.error("Stack:", error instanceof Error ? error.stack : "N/A");
    
    return res.status(500).json({
      success: false,
      error: {
        code: "UPLOAD_FAILED",
        message: error instanceof Error ? error.message : "Failed to upload images"
      }
    });
  }
}
