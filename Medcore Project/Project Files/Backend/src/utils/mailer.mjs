import nodemailer from "nodemailer";
import { Resend } from "resend";
import {config} from "../config/config.mjs"

const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

const transporter = config.mailUser
    ? nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
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

export function otpTemplate({name, otp, minutes = 5}) {
    return `
  <div style="font-family:Inter,Arial,sans-serif;background:#f7fafc;padding:32px">
    <div style="max-width:480px;margin:auto;background:#fff;border-radius:12px;padding:0;border:1px solid #e2e8f0;overflow:hidden">
      <div style="background:#0c55a5;padding:24px;text-align:left;">
        <h2 style="color:#ffffff;margin:0 0 4px;font-size:24px;">MedCore HMS</h2>
        <p style="color:#bfdbfe;margin:0;font-size:14px;">Hospital Management System</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#334155;margin:0 0 16px">Hi <strong>${name || "there"}</strong>,</p>
        <p style="color:#334155;margin:0 0 24px">Use the verification code below to confirm your email address.</p>
        
        <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#1d4ed8;text-align:center;padding:24px;background:#f0f9ff;border:2px dashed #3b82f6;border-radius:8px;margin:0 0 24px">
          ${otp}
        </div>
        
        <p style="color:#64748b;font-size:14px;margin:0;text-align:center;">
          Expires in ${minutes} minutes
        </p>
        
        <p style="color:#94a3b8;font-size:13px;margin:32px 0 0 0;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    </div>
  </div>`;
}

export function welcomeTemplate({name}) {
    return `
  <div style="font-family:Inter,Arial,sans-serif;background:#f7fafc;padding:32px">
    <div style="max-width:480px;margin:auto;background:#fff;border-radius:12px;padding:0;border:1px solid #e2e8f0;overflow:hidden">
      <div style="background:#059669;padding:24px;text-align:left;">
        <h2 style="color:#ffffff;margin:0 0 4px;font-size:24px;">MedCore HMS</h2>
        <p style="color:#a7f3d0;margin:0;font-size:14px;">Account Verified Successfully</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#334155;margin:0 0 16px">Hi <strong>${name || "there"}</strong>,</p>
        <p style="color:#334155;margin:0 0 16px">Your email address has been successfully verified.</p>
        <p style="color:#334155;margin:0 0 24px">Welcome to MedCore HMS! You can now access your dashboard and manage your clinical operations.</p>
        
        <div style="text-align:center;">
          <a href="https://medcore.local/dashboard" style="display:inline-block;background:#059669;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:6px;">Go to Dashboard</a>
        </div>
        
        <p style="color:#94a3b8;font-size:13px;margin:32px 0 0 0;">
          If you have any questions, feel free to reply to this email.
        </p>
      </div>
    </div>
  </div>`;
}

export async function sendOtpEmail({to, name, otp}) {
    try {
        if (resend) {
            const { data, error } = await resend.emails.send({
                from: FROM,
                to: [to],
                subject: "MedCore HMS - Your Verification Code",
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
            subject: "MedCore HMS - Your Verification Code",
            html: otpTemplate({name, otp}),
        });
        
        return result;
    } catch (error) {
        console.error("Failed to send OTP Email:", error.message);
        console.log(`\n[FALLBACK DEV MAIL] OTP for ${to}: ${otp}\n`);
        return { success: false, error: error.message };
    }
}

export async function sendWelcomeEmail({to, name}) {
    try {
        if (resend) {
            const { data, error } = await resend.emails.send({
                from: FROM,
                to: [to],
                subject: "Welcome to MedCore HMS - Email Verified",
                html: welcomeTemplate({name})
            });
            if (error) throw new Error(error.message);
            return data;
        }

        if (!transporter) {
            console.log(`\n[DEV MAIL] Welcome Email for ${to}\n`);
            return {dev: true};
        }
        
        const result = await transporter.sendMail({
            from: FROM,
            to,
            subject: "Welcome to MedCore HMS - Email Verified",
            html: welcomeTemplate({name}),
        });
        
        return result;
    } catch (error) {
        console.error("Failed to send Welcome Email:", error.message);
        return { success: false, error: error.message };
    }
}
