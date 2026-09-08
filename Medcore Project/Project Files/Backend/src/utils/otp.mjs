import bcrypt from "bcrypt";
import crypto from "crypto";

const OTP_SALT_ROUNDS = 10;
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;

export const generateOtp = () => {
    const min = 10 ** (OTP_LENGTH - 1);
    const max = 10 ** OTP_LENGTH;
    return String(crypto.randomInt(min, max));
};

export const hashOtp = async (plainOtp) => {
    return bcrypt.hash(plainOtp, OTP_SALT_ROUNDS);
};

export const compareOtp = async (plainOtp, hashedOtp) => {
    return bcrypt.compare(plainOtp, hashedOtp);
};

export const getOtpExpiry = () => {
    return new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
};
