import User from "../../models/user.model.mjs";
import Otp from "../../models/otp.model.mjs";
import {generateOtp, hashOtp, compareOtp, getOtpExpiry} from "../../utils/otp.mjs";
import {sendOtpEmail} from "../../utils/mailer.mjs";

const MAX_ATTEMPTS = 5;

export async function issueOtp(email, fullName) {
    const code = generateOtp();
    const codeHash = await hashOtp(code);

    await Otp.deleteMany({email, purpose: "signup", consumedAt: null});
    await Otp.create({
        email,
        codeHash,
        purpose: "signup",
        expiresAt: getOtpExpiry(),
    });

    await sendOtpEmail({to: email, name: fullName, otp: code});
}

export async function verifyOtp(req, res) {
    try {
        const {email, code} = req.body || {};
        if (!email || !code) return res.status(400).json({message: "Email and code required"});
        if (String(code).length !== 6) return res.status(400).json({message: "Invalid code"});

        const otp = await Otp.findOne({
            email: String(email).toLowerCase(),
            purpose: "signup",
            consumedAt: null,
        }).sort({createdAt: -1});

        if (!otp) return res.status(400).json({message: "No pending OTP"});
        if (otp.expiresAt < new Date()) return res.status(400).json({message: "OTP expired"});
        if (otp.attempts >= MAX_ATTEMPTS) return res.status(429).json({message: "Too many attempts"});

        const ok = await compareOtp(String(code), otp.codeHash);
        otp.attempts += 1;

        if (!ok) {
            await otp.save();
            return res.status(400).json({message: "Invalid code"});
        }

        otp.consumedAt = new Date();
        await otp.save();
        await User.updateOne({email}, {emailVerified: true});

        return res.json({message: "Email verified"});
    } catch (err) {
        console.error("verifyOtp error:", err);
        return res.status(500).json({message: "Server error"});
    }
}

export async function resendOtp(req, res) {
    try {
        const {email} = req.body || {};
        if (!email) return res.status(400).json({message: "Email required"});

        const user = await User.findOne({email: String(email).toLowerCase()});
        if (user && !user.emailVerified) {
            await issueOtp(user.email, user.fullName);
        }
        return res.json({message: "If the email exists, an OTP was sent."});
    } catch (err) {
        console.error("resendOtp error:", err);
        return res.status(500).json({message: "Server error"});
    }
}
