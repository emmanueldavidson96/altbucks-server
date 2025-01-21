import { Request, Response, NextFunction } from 'express';
import {
  getAllCards,
  createCard,
  updateCardById,
  deleteCardById,
} from '../services/card.service';

export const getCards = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cards = await getAllCards();
    res.status(200).json({ success: true, data: cards });
  } catch (error) {
    next(error);
  }
};

export const addCard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, cardNumber, expiryDate, cardType } = req.body;
    if (!userId || !cardNumber || !expiryDate || !cardType) {
      res
        .status(400)
        .json({ success: false, message: 'Missing required fields' });
      return;
    }
    const newCard = await createCard({
      userId,
      cardNumber,
      expiryDate,
      cardType,
    });
    res.status(201).json({ success: true, data: newCard });
  } catch (error) {
    next(error);
  }
};

export const updateCard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedCard = await updateCardById(id, req.body);
    if (!updatedCard) {
      res.status(404).json({ success: false, message: 'Card not found' });
      return;
    }
    res.status(200).json({ success: true, data: updatedCard });
  } catch (error) {
    next(error);
  }
};

export const deleteCard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedCard = await deleteCardById(id);
    if (!deletedCard) {
      res.status(404).json({ success: false, message: 'Card not found' });
      return;
    }
    res
      .status(200)
      .json({ success: true, message: 'Card deleted successfully' });
  } catch (error) {
    next(error);
  }
};
