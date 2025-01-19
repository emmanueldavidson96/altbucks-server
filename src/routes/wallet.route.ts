import express from "express"
import verifyToken from "../middlewares/verifyToken";
import { WalletInformationHandler } from "../controllers/wallet.controller";


const router = express.Router();

router.get("/get-wallet", verifyToken, WalletInformationHandler);

export default router