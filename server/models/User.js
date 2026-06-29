import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    subscriptionTier: {
        type: String,
        enum: ["free", "premium"],
        default: "free"
    },
    resetPasswordToken:   { type: String,  default: undefined },
    resetPasswordExpires: { type: Date,    default: undefined },
}, { timestamps: true });

userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

const User = mongoose.model("User", userSchema);

export default User;