import nodemailer from "nodemailer";
import { Resend } from "resend";
import {config} from "../config/config.mjs"

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

const transporter = config.mailUser
    ? nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: config.mailUser,
              pass: config.mailPass,
          },
          // Add timeouts to prevent hanging on Render/blocked ports
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 5000,
      })
    : null;

const FROM = config.mailFrom || "MedCore HMS <no-reply@medcore.local>";

export function otpTemplate({name, otp, minutes = 10}) {
    return `
  <div style="font-family:Inter,Arial,sans-serif;background:#f7fafc;padding:32px">
    <div style="max-width:480px;margin:auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0">
      <h2 style="color:#0f766e;margin:0 0 8px">MedCore HMS</h2>
      <p style="color:#334155;margin:16px 0 8px">Hi ${name || "there"},</p>
      <p style="color:#334155;margin:0 0 16px">Use the code below to verify your email address:</p>
      <div style="font-size:32px;font-weight:700;letter-spacing:10px;color:#0f766e;text-align:center;padding:18px;background:#f0fdfa;border-radius:8px;margin:16px 0">
        ${otp}
      </div>
      <p style="color:#64748b;font-size:14px;margin:16px 0 0">
        This code expires in ${minutes} minutes. If you didn't request it, ignore this email.
      </p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0" />
      <p style="color:#94a3b8;font-size:12px;margin:0">c MedCore HMS - Clinical Operations</p>
    </div>
  </div>`;
}

export async function sendOtpEmail({to, name, otp}) {
    try {
        if (resend) {
            const { data, error } = await resend.emails.send({
                from: FROM,
                to: [to],
                subject: "Your MedCore HMS verification code",
                html: otpTemplate({name, otp})
            });
            if (error) throw new Error(error.message);
            return data;
        }

        if (!transporter) {
            console.log(`\n[DEV MAIL] OTP for ${to}: ${otp}\n`);
            return {dev: true};
        }
        
        const result = await transporter.sendMail({
            from: FROM,
            to,
            subject: "Your MedCore HMS verification code",
            html: otpTemplate({name, otp}),
        });
        
        return result;
    } catch (error) {
        console.error("Failed to send OTP Email:", error.message);
        // Log OTP to console so developer can still verify accounts during testing/deployment issues
        console.log(`\n[FALLBACK DEV MAIL] OTP for ${to}: ${otp}\n`);
        
        // Return without crashing so the user registration still completes successfully
        return { success: false, error: error.message };
    }
}
