import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/user.model.mjs";
import Hospital from "../src/models/hospital.model.mjs";
import bcrypt from "bcrypt";

dotenv.config();

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB...");

        // Clear existing data
        await User.deleteMany({});
        await Hospital.deleteMany({});
        console.log("Cleared existing users and hospitals...");

        // Create hospital
        const hospital = await Hospital.create({
            name: "Medcore General Hospital",
            location: "Mumbai, India",
            contactNumber: "1234567890",
            email: "info@medcore.com"
        });

        // Create Super Admin
        const passwordHash = await bcrypt.hash("Admin@123", 12);
        await User.create({
            firstName: "Super",
            lastName: "Admin",
            email: "superadmin@medcore.com",
            phone: "9876543210",
            role: "super_admin",
            passwordHash,
            hospitalId: hospital._id,
            isEmailVerified: true
        });

        // Create standard Admin
        await User.create({
            firstName: "Hospital",
            lastName: "Admin",
            email: "admin@medcore.com",
            phone: "9876543211",
            role: "admin",
            passwordHash,
            hospitalId: hospital._id,
            isEmailVerified: true
        });

        console.log("Seeding complete! You can login with:");
        console.log("Super Admin: superadmin@medcore.com / Admin@123");
        console.log("Admin: admin@medcore.com / Admin@123");

        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seed();
