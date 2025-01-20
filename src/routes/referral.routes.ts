import express from "express";
import verifyToken from "../middlewares/verifyToken";
import router from "./user.routes";
import { referralLinkHandler } from "../controllers/referral.controller";

const referralRoutes = express.Router();

//prefix : /referrals
//Send invite link to a mail
referralRoutes.post("/invite", verifyToken, );

// Retrieve logged in users referral code
referralRoutes.get("/link", verifyToken, referralLinkHandler);

// Retrieve List of referals for logged in user
referralRoutes.get("/", verifyToken, );

// Export list of referals
referralRoutes.get("/export",);

export default referralRoutes