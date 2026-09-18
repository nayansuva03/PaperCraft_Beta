import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  signup,
  verifySignupOTP,
  login,
  forgotPassword,
  verifyForgotOTP,
  resetPassword,
  getCurrentUser,
  logout,
  refreshAccessToken,
} from "../controllers/authController.js";
import askGemini from "../controllers/geminiController.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/verify-signup", verifySignupOTP);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-forgot-password", verifyForgotOTP);
router.post("/reset-password", resetPassword);
router.get("/me", authMiddleware, getCurrentUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/logout", logout);

export default router;
