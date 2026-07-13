import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
        },

        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Patient",
            required: true,
        },

        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        },
        scheduledAt: {type: Date, required: true},
        durationMin: {type: Number, default: 15},

        type: {
            type: String,
            enum: ["opd", "follow_up", "tele", "emergency"],
            default: "opd",
        },

        status: {
            type: String,
            enum: ["scheduled", "checked_in", "in_consultation", "completed", "cancelled", "no_show"],
            default: "scheduled",
        },

        reason: {type: String},

        bookedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        cancelledAt: {type: Date},
        cancelReason: {type: String},
        encounterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MedicalRecord",
        },
    },
    {timestamps: true},
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
