import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
    {
        hospitalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Hospital",
            required: true,
        },
        mrn: {
            type: String,
            required: true,
            trim: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        dob: {type: Date, required: true},
        gender: {
            type: String,
            enum: ["male", "female", "other"],
        },
        bloodGroup: {
            type: String,
            enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"],
            default: "unknown",
        },
        phone: {type: String},
        email: {type: String, lowercase: true, trim: true},
        address: {
            line1: {type: String},
            city: {type: String},
            state: {type: String},
            pincode: {type: String},
            _id: false,
        },
        emergencyContact: {
            name: {type: String},
            phone: {type: String},
            relation: {type: String},
            _id: false,
        },
        allergies: [{type: String}],
        chronicConditions: [{type: String}],
    },
    {timestamps: true},
);

patientSchema.index({hospitalId: 1, mrn: 1}, {unique: true});
patientSchema.index({hospitalId: 1, phone: 1});
patientSchema.index({userId: 1});

const Patient = mongoose.model("Patient", patientSchema);

export default Patient;
