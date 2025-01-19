import express from "express";
import * as Controller from "../controllers/paypal.controller";
import verifyToken from "../middlewares/verifyToken";
const router = express.Router();

router.post("/withdrawal",verifyToken, Controller.WithdrawalHandler);
router.post("/deposit",verifyToken, Controller.createOrderHandler);
router.get ("/confirm-deposit", Controller.captureOrderHandler);











export default router