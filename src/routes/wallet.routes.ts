import { Router } from 'express';
import { fetchWalletSummary } from '../controllers/wallet.controller';
import verifyToken from '../middlewares/verifyToken';

const router = Router();

router.get('/:userId', verifyToken, fetchWalletSummary);

export default router;
