import mongoose, { Schema, Document } from "mongoose";

export type ReferralStatus = "Pending" | "Active" | "Completed";

export interface Referral extends Document {
    referrerUserId: mongoose.Types.ObjectId; // The user making the referral
    referredUserId?: mongoose.Types.ObjectId; // The referred user (after registration)
    referralCode: string; // Unique code for the referrer
    referralLink: string; // Unique referral link
    rewardClaimed: boolean; // Whether the reward has been claimed
    status: ReferralStatus; // Status of the referral
    statusHistory: { status: ReferralStatus; updatedAt: Date }[]; // Track status changes
    createdAt: Date;
    updatedAt: Date;
}

const referralSchema = new mongoose.Schema(
    {
        referrerUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        referredUserId: { type: Schema.Types.ObjectId, ref: "User" },
        referralCode: { type: String, required: true, unique: true },
        referralLink: { type: String, required: true, unique: true },
        rewardClaimed: { type: Boolean, default: false },
        status: { type: String, enum: ["Pending", "Active", "Completed"], default: "Pending" },
        statusHistory: [
            {
                status: { type: String, enum: ["Pending", "Active", "Completed"], required: true },
                updatedAt: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

// Middleware to track status changes
referralSchema.pre("save", function (next) {
    if (this.isModified("status")) {
        this.statusHistory.push({ status: this.status, updatedAt: new Date() });
    }
    next();
});

export default mongoose.model("Referral", referralSchema);
