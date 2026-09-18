import express from "express";
import {
  createFeedback,
  getFeedback,
  deleteFeedback,
} from "../controllers/feedbackController.js";

const router = express.Router();

router.post("/", createFeedback);
router.get("/", getFeedback);
router.delete("/:id", deleteFeedback);

export default router;
