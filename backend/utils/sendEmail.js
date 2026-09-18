import { BrevoClient } from "@getbrevo/brevo";
import dotenv from "dotenv";
dotenv.config();

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await brevo.transactionalEmails.sendTransacEmail({
      sender: { name: "PaperCraft", email: "papercraft-nyn@outlook.com" },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    });
    return info;
  } catch (err) {
    console.error("Email send failed:", err.message);
    throw new Error("Failed to send email");
  }
};

export default sendEmail;
