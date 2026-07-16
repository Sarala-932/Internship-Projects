import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in environment variables");
}

export const config = {
    MONGO_URI: process.env.MONGO_URI,
    PORT: process.env.PORT || 5000,
    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTokenExpiry: "15m",
    refreshTokenExpiry: "7d",
    mailPass: process.env.MAIL_PASS,
    mailUser: process.env.MAIL_USER,
    mailFrom: process.env.MAIL_FROM,
};
