import { Request, Response, NextFunction } from 'express';
import { getWalletSummary } from '../services/wallet.service';

// Controller for Wallet Summary
export const fetchWalletSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId } = req.params; // User ID passed as a URL param
    const { period } = req.query; // Query param: 'today' or 'all'

    if (!userId) {
      res.status(400).json({ success: false, message: 'User ID is required' });
      return;
    }
    // Default to 'all' if no period is provided
    const walletData = await getWalletSummary(
      userId,
      (period as string) || 'all'
    );

    if (!walletData) {
      res.status(404).json({ success: false, message: 'No wallet data found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: walletData,
    });
  } catch (error) {
    next(error);
  }
};
