import { Router } from "express";
import multer from "multer";
import { storage } from "../firebase-admin";
import { authenticateUser, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post("/image", authenticateUser, upload.single("file"), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    const userId = req.user!.uid;
    const timestamp = Date.now();
    const filename = `${userId}/${timestamp}-${req.file.originalname}`;

    const bucket = storage.bucket();
    const file = bucket.file(filename);

    await file.save(req.file.buffer, {
      metadata: {
        contentType: req.file.mimetype,
      },
    });

    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

    res.json({ url: publicUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload file" });
  }
});

export default router;
