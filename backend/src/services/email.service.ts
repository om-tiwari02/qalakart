import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import { logger } from "./logger.js";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;

  if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
    const isSecure = env.SMTP_PORT === 465 || env.SMTP_SECURE === true;
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: isSecure,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    });
    return transporter;
  }

  return null;
}

export async function sendOtpEmail(email: string, otp: string, expiresInMinutes: number = 10): Promise<void> {
  const mailer = getTransporter();

  // If SMTP is not yet configured, provide a dev console fallback
  if (!mailer) {
    console.log("\n" + "=".repeat(60));
    console.log(`📧 [QalaKart OTP Delivery - Console Mode]`);
    console.log(`📬 To: ${email}`);
    console.log(`🔑 Verification Code: ${otp}`);
    console.log(`⏳ Valid for: ${expiresInMinutes} minutes`);
    console.log("ℹ️  To send real emails, set SMTP_HOST, SMTP_USER, SMTP_PASS in backend/.env");
    console.log("=".repeat(60) + "\n");
    return;
  }

  const fromAddress = env.SMTP_FROM || `"QalaKart" <${env.SMTP_USER}>`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background-color: #0f172a; border-radius: 16px; color: #f8fafc; border: 1px solid rgba(255, 255, 255, 0.1);">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">QalaKart</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Verification Code</p>
      </div>
      <div style="background-color: rgba(255, 255, 255, 0.05); padding: 24px; border-radius: 12px; text-align: center; margin-bottom: 24px;">
        <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 16px;">Use the verification code below to complete your login or registration:</p>
        <div style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; padding: 12px 24px; background: rgba(56, 189, 248, 0.1); border-radius: 8px; border: 1px solid rgba(56, 189, 248, 0.3);">
          ${otp}
        </div>
        <p style="color: #64748b; font-size: 12px; margin-top: 16px; margin-bottom: 0;">This code will expire in ${expiresInMinutes} minutes.</p>
      </div>
      <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
        If you did not request this verification code, please ignore this email.
      </p>
    </div>
  `;

  try {
    await mailer.sendMail({
      from: fromAddress,
      to: email,
      subject: `Your QalaKart Verification Code: ${otp}`,
      text: `Your QalaKart verification code is: ${otp}. It expires in ${expiresInMinutes} minutes.`,
      html: htmlContent
    });
    logger.info("otp_email_sent", { email });
  } catch (error) {
    logger.error("otp_email_send_failed", { email, error });
    
    // In development mode, log the OTP to console if SMTP delivery fails so testing is never blocked
    if (env.NODE_ENV === "development") {
      console.warn(`\n⚠️ SMTP failed to send to ${email}. Fallback OTP code: ${otp}\n`);
      return;
    }

    throw new Error("Failed to send verification email. Please try again later.");
  }
}
