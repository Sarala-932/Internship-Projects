import mongoose from "mongoose";

const userRoles = [
    "Super Admin",
    "Hospital Admin",
    "Doctor",
    "Nurse",
    "Receptionist",
    "Lab Technician",
    "Pharmacist",
    "Accountant",
    "Patient",
];

const userSchema = new mongoose.Schema(
    {
        email: {type: String, required: true, unique: true},
        password: {type: String, required: true},
        role: {type: String, enum: userRoles, required: true},
        hospitalId: {type: mongoose.Schema.Types.ObjectId, ref: "Hospital"},
        isEmailVerified: {type: Boolean, default: false},
        refreshToken: {type: String},
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        phone: {type: String},
    },
    {timestamps: true},
);
const User = mongoose.model("User", userSchema);

export default User;
