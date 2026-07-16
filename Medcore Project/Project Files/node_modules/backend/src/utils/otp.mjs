import bcrypt from "bcrypt";
import crypto from "crypto";

const OTP_SALT_ROUNDS = 10;
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

/**
 * 6-digit numeric OTP — crypto.randomInt is cryptographically secure
 * (Math.random is predictable, never use it for OTPs)
 */
export const generateOtp = () => {
    const min = 10 ** (OTP_LENGTH - 1); // 100000
    const max = 10 ** OTP_LENGTH; // 1000000
    return String(crypto.randomInt(min, max)); // "483920"
};

/**
 * Hash before saving to DB — same reason as passwords/refresh tokens.
 * Agar DB leak ho jaaye, plain OTP na mile.
 */
export const hashOtp = async (plainOtp) => {
    return bcrypt.hash(plainOtp, OTP_SALT_ROUNDS);
};

/**
 * Verify during /verify-otp — bcrypt.compare is timing-safe
 */
export const compareOtp = async (plainOtp, hashedOtp) => {
    return bcrypt.compare(plainOtp, hashedOtp);
};

/**
 * Expiry timestamp — controller iska use karega Otp doc banate waqt
 */
export const getOtpExpiry = () => {
    return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};
