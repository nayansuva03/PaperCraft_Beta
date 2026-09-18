import express from "express";
import upload from "../middleware/multer.js";
import authMiddleware from "../middleware/authMiddleware.js"; // your existing JWT middleware
import {
  savePdf,
  getsavedServicess,
  deletesavedServices,
} from "../controllers/SavedServicesController.js";

const router = express.Router();

router.post("/saved-pdfs", authMiddleware, upload.single("pdf"), savePdf);
router.get("/saved-pdfs", authMiddleware, getsavedServicess);
router.delete("/saved-pdfs/:id", authMiddleware, deletesavedServices);

export default router;