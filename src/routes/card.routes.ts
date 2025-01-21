import { Router } from 'express';
import { getCards, addCard, updateCard, deleteCard } from '../controllers/card.controller';
import verifyToken from '../middlewares/verifyToken';

const router = Router();

router.get('/', verifyToken, getCards);
router.post('/', verifyToken, addCard);
router.put('/:id', verifyToken, updateCard);
router.delete('/:id', verifyToken, deleteCard);

export default router;
