import { RequestHandler } from "express";
import { Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import ReferralModel from "../models/referral.model";
import UserModel from "../models/user.model";
import QRCode from "qrcode";

// Generate a new referral
export const generateReferral = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.body;

    try {
        const user = await UserModel.findById(userId);
        if (!user) throw createHttpError(404, "User not found");

        const referralCode = `REF-${userId.toString().slice(-5)}-${Date.now()}`;
        const referralLink = `https://your-app.com/referral/${referralCode}`;

        const referral = await ReferralModel.create({
            referrerUserId: userId,
            referralCode,
            referralLink,
            status: "Pending",
        });

        const qrCode = await QRCode.toDataURL(referralLink);

        res.status(201).json({
            success: true,
            message: "Referral created successfully",
            referral,
            qrCode,
        });
    } catch (error) {
        next(error);
    }
};

// Track referrals by user ID
export const trackReferrals = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    try {
        const referrals = await ReferralModel.find({ referrerUserId: userId }).exec();
        if (!referrals) throw createHttpError(404, "No referrals found");

        res.status(200).json({
            success: true,
            message: "Referrals retrieved successfully",
            referrals,
        });
    } catch (error) {
        next(error);
    }
};

// Get leaderboard for referrals
export const getLeaderboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const leaderboard = await ReferralModel.aggregate([
            { $group: { _id: "$referrerUserId", referralCount: { $sum: 1 } } },
            { $sort: { referralCount: -1 } },
            { $limit: 10 },
        ]);

        res.status(200).json({
            success: true,
            message: "Leaderboard retrieved successfully",
            leaderboard,
        });
    } catch (error) {
        next(error);
    }
};

// Claim referral reward
export const claimReward = async (req: Request, res: Response, next: NextFunction) => {
    const { userId, referralId } = req.body;

    try {
        const referral = await ReferralModel.findById(referralId);
        if (!referral || referral.referrerUserId.toString() !== userId) {
            throw createHttpError(404, "Referral not found or not eligible");
        }

        if (referral.rewardClaimed) {
            throw createHttpError(400, "Reward already claimed");
        }

        referral.rewardClaimed = true;
        await referral.save();

        res.status(200).json({
            success: true,
            message: "Reward claimed successfully",
            reward: referral,
        });
    } catch (error) {
        next(error);
    }
};

// Generate QR Code for referral link
export const generateQRCode = async (req: Request, res: Response, next: NextFunction) => {
    const { referralLink } = req.body;

    try {
        const qrCode = await QRCode.toDataURL(referralLink);

        res.status(201).json({
            success: true,
            message: "QR Code generated successfully",
            qrCode,
        });
    } catch (error) {
        next(error);
    }
};

// Update referral status
export const updateReferralStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { referralId, status } = req.body;

    try {
        const referral = await ReferralModel.findById(referralId);
        if (!referral) throw createHttpError(404, "Referral not found");

        referral.status = status;
        await referral.save();

        res.status(200).json({
            success: true,
            message: "Referral status updated successfully",
            updatedReferral: referral,
        });
    } catch (error) {
        next(error);
    }
};

// Get all referrals
export const getAllReferrals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const referrals = await ReferralModel.find().exec();

        res.status(200).json({
            success: true,
            message: "All referrals retrieved successfully",
            referrals,
        });
    } catch (error) {
        next(error);
    }
};


// Get referral analytics for admin
export const getReferralAnalytics: RequestHandler = async (req, res, next) => {
    try {
        const totalReferrals = await ReferralModel.countDocuments();
        const pendingReferrals = await ReferralModel.countDocuments({ status: "Pending" });
        const activeReferrals = await ReferralModel.countDocuments({ status: "Active" });
        const completedReferrals = await ReferralModel.countDocuments({ status: "Completed" });

        res.status(200).json({
            success: true,
            message: "Referral analytics retrieved successfully",
            analytics: {
                totalReferrals,
                pendingReferrals,
                activeReferrals,
                completedReferrals,
            },
        });
    } catch (error) {
        next(error);
    }
};
