import express from "express";
import * as Controller from "../controllers/referral.controller";
import verifyToken from "../middlewares/verifyToken";

const router = express.Router();

// Generate a referral
router.post("/generate", verifyToken, Controller.generateReferral);

// Track referrals by user ID
router.get("/track/:userId", verifyToken,  Controller.trackReferrals);

// Get leaderboard
router.get("/leaderboard", Controller.getLeaderboard);

// Claim a reward
router.post("/claim-reward", Controller.claimReward);

// Generate QR Code for referral link
router.post("/qr-code", Controller.generateQRCode);

// Update referral status
router.put("/update-status", verifyToken,  Controller.updateReferralStatus);

// Get all referrals
router.get("/", verifyToken, Controller.getAllReferrals);

// Get referral analytics (admin)
router.get("/referrals/analytics", verifyToken,  Controller.getReferralAnalytics);

export default router;
