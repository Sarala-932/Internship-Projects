import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ["APPOINTMENT", "LAB_REPORT", "SYSTEM", "INVENTORY", "BILLING"],
      default: "SYSTEM"
    },
    isRead: {
      type: Boolean,
      default: false
    },
    link: {
      type: String, // Optional URL to navigate to when clicked
      default: ""
    }
  },
  { timestamps: true }
);

// Auto-delete notifications older than 30 days to prevent DB bloat
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
