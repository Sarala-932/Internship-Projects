import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
    {
        dayOfWeek: {type: Number, min: 0, max: 6, required: true},
        startTime: {type: String, required: true},
        endTime: {type: String, required: true},
        slotDurationMin: {type: Number, default: 15},
    },
    {_id: false},
);

const doctorSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Department",
        },
        specialization: [{type: String}],
        qualifications: [{type: String}],
        licenseNumber: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },
        yearsOfExperience: {type: Number, min: 0},
        consultationFee: {type: Number, min: 0},
        bio: {type: String},
        availability: [availabilitySchema],
        isAcceptingAppointments: {type: Boolean, default: true},
    },
    {timestamps: true},
);

doctorSchema.index({hospitalId: 1, departmentId: 1});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
