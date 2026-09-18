import express from "express";
import askGemini from "../controllers/geminiController.js";
import multer from "multer";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
});

router.post("/generate", upload.single("pdf"), askGemini);

export default router;