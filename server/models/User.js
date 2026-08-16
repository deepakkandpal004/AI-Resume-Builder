import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firebaseUid: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    subscriptionTier: {
        type: String,
        enum: ["free", "premium"],
        default: "free"
    },
    razorpayOrderId:      { type: String,  default: null },
    razorpayPaymentId:    { type: String,  default: null },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
