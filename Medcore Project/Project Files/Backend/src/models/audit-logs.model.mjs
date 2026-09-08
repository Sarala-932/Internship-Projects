import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
    {
        hospitalId: {type: mongoose.Schema.Types.ObjectId, ref: "Hospital", index: true},
        userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true},
        userRole: {type: String, required: true},
        action: {
            type: String,
            enum: [
                "create",
                "read",
                "update",
                "delete",
                "login",
                "logout",
                "login_failed",
                "password_change",
                "export",
                "print",
                "register",
                "verify",
            ],
            required: true,
        },
        resource: {
            type: String,
            enum: [
                "patient",
                "appointment",
                "encounter",
                "prescription",
                "labOrder",
                "bill",
                "user",
                "inventory",
                "auth",
                "speciality",
                "ticket",
            ],
            required: true,
        },
        resourceId: {type: mongoose.Schema.Types.ObjectId},
        ipAddress: {type: String},
        userAgent: {type: String},
        method: {type: String},
        endpoint: {type: String},
        statusCode: {type: Number},
        changes: {type: mongoose.Schema.Types.Mixed},
        metadata: {type: mongoose.Schema.Types.Mixed},
        success: {type: Boolean, default: true},
        errorMessage: {type: String},
    },
    {timestamps: true},
);

auditLogSchema.index({hospitalId: 1, createdAt: -1});
auditLogSchema.index({hospitalId: 1, userId: 1, createdAt: -1});
auditLogSchema.index({hospitalId: 1, resource: 1, resourceId: 1});
auditLogSchema.index({hospitalId: 1, action: 1, createdAt: -1});

auditLogSchema.index({createdAt: 1}, {expireAfterSeconds: 60 * 60 * 24 * 365 * 7});

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
