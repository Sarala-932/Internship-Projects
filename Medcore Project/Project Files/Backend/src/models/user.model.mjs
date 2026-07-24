import mongoose from "mongoose";

const userRoles = [
    "super_admin",
    "admin",
    "doctor",
    "nurse",
    "receptionist",
    "pharmacist",
    "lab_tech",
    "accountant",
    "patient",
];

const userSchema = new mongoose.Schema(
    {
        hospitalId: {type: mongoose.Schema.Types.ObjectId, ref: "Hospital"},
        email: {type: String, required: true, unique: true},
        passwordHash: {type: String, required: true},
        role: {type: String, enum: userRoles, required: true},
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        phone: {type: String},
        departmentId: {type: mongoose.Schema.Types.ObjectId, ref: "Department"},
        avatarUrl: {type: String},
        isEmailVerified: {type: Boolean, default: false},
        isActive: {type: Boolean, default: true},
        lastLoginAt: {type: Date},
    },
    {timestamps: true},
);

userSchema.index({hospitalId: 1, role: 1});
userSchema.index({hospitalId: 1, isActive: 1});

const User = mongoose.model("User", userSchema);

export default User;
