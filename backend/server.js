import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
import SavedServicesRoutes from "./routes/SavedServicesRoutes.js"
import RazorpayRoutes from "./routes/razorpayRoutes.js";
import sendEmail from "./utils/sendEmail.js";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

connectDB();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/feedback", feedbackRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api", SavedServicesRoutes);
app.use("/api/payment", RazorpayRoutes)

app.get("/test-email", async (req, res) => {
  try {
    await sendEmail(
      "pathlessnyn@gmail.com",
      "PaperCraft Test",
      "<h2>Email is working! 🎉</h2>",
    );

    res.send("Email sent.");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

app.get("/", (req, res) => {
  res.send("✅ Backend running...");
});

app.listen(5000, () => {
  console.log("✅ server is running...");
});
