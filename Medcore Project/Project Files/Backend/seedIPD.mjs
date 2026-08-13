import mongoose from "mongoose";
import Ward from "./src/models/ward.model.mjs";
import Bed from "./src/models/bed.model.mjs";

const MONGO_URI = "mongodb+srv://msarala492_db_user:66OfqzVuE2vd6btT@cluster0.6k6b5lx.mongodb.net/medcore-hms?retryWrites=true&w=majority";

async function seed() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");

        // Find any hospital
        const Hospital = (await import("./src/models/hospital.model.mjs")).default;
        const hospital = await Hospital.findOne();
        
        if (!hospital) {
            console.log("No hospital found!");
            process.exit(1);
        }

        const hospitalId = hospital._id;
        
        // Create General Ward
        const generalWard = new Ward({
            hospitalId,
            name: "General Ward A",
            type: "General",
            capacity: 10,
            baseChargePerDay: 1500
        });
        await generalWard.save();

        // Create ICU
        const icuWard = new Ward({
            hospitalId,
            name: "Intensive Care Unit",
            type: "ICU",
            capacity: 4,
            baseChargePerDay: 5000
        });
        await icuWard.save();

        // Create beds for General Ward
        for (let i = 1; i <= 10; i++) {
            await new Bed({
                wardId: generalWard._id,
                bedNumber: `G-A-${i.toString().padStart(2, '0')}`,
                status: 'available'
            }).save();
        }

        // Create beds for ICU
        for (let i = 1; i <= 4; i++) {
            await new Bed({
                wardId: icuWard._id,
                bedNumber: `ICU-${i.toString().padStart(2, '0')}`,
                status: 'available'
            }).save();
        }

        console.log("Seed complete! Wards and Beds created.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

seed();
