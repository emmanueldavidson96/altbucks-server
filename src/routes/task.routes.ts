import { Router } from 'express';
import { getEarningsReport, addEarning } from '../controllers/task.controller';
import verifyToken from '../middlewares/verifyToken';

const router = Router();

router.get('/:userId', verifyToken, getEarningsReport);
router.post('/', verifyToken, addEarning);

export default router;
