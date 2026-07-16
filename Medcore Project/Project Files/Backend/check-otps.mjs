import mongoose from "mongoose";
import { config } from "./src/config/config.mjs";
import Otp from "./src/models/otp.model.mjs";

async function run() {
    await mongoose.connect(config.MONGO_URI);
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log("Users:", users.map(u => ({ email: u.email, isEmailVerified: u.isEmailVerified })));
    process.exit(0);
}
run();
