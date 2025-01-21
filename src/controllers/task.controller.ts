import { Request, Response, NextFunction } from 'express';
import { getTaskEarnings, addTaskEarning } from '../services/task.service';
import { updateWalletEarnings } from '../services/wallet.service';
import User from '../models/user.model';


export const getEarningsReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { timeFrame } = req.query;

    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }
    // Define date filter based on the timeFrame
    let dateFilter = {};
    if (timeFrame === 'year') {
      dateFilter = { date: { $gte: new Date(new Date().getFullYear(), 0, 1) } };
    } else if (timeFrame === '7days') {
      const today = new Date();
      const weekAgo = new Date(today.setDate(today.getDate() - 7));
      dateFilter = { date: { $gte: weekAgo } };
    } else if (timeFrame === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateFilter = { date: { $gte: today } };
    }

    const tasks = await getTaskEarnings(userId, dateFilter);
    res.status(200).json({ success: true, data: tasks });
  } catch (error) {
    next(error);
  }
};

export const addEarning = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, earnings, date } = req.body;

    if (!userId || !earnings) {
      res
        .status(400)
        .json({ success: false, message: 'Missing required fields' });
      return;
    }

    // Verify user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Add the task earning
    const earning = await addTaskEarning({ userId, earnings, date });

    // Update wallet summary
    await updateWalletEarnings(userId, earnings);

    res.status(201).json({ success: true, data: earning });
  } catch (error) {
    next(error);
  }
};
