import express from "express";
import {
    generateReferral,
    trackReferrals,
    getLeaderboard,
    claimReward,
    generateQRCode,
    updateReferralStatus,
    getAllReferrals,
    getReferralAnalytics,
} from "../controllers/referral.controller";

const router = express.Router();

// Generate a referral
router.post("/generate", generateReferral);

// Track referrals by user ID
router.get("/track/:userId", trackReferrals);

// Get leaderboard
router.get("/leaderboard", getLeaderboard);

// Claim a reward
router.post("/claim-reward", claimReward);

// Generate QR Code for referral link
router.post("/qr-code", generateQRCode);

// Update referral status
router.put("/update-status", updateReferralStatus);

// Get all referrals
router.get("/", getAllReferrals);

// Get referral analytics (admin)
router.get("/referrals/analytics", getReferralAnalytics);

export default router;
