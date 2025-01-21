import Wallet from '../models/wallet.model';
import { startOfToday, endOfDay } from 'date-fns';

// Fetch Wallet Summary with Period Filter
export const getWalletSummary = async (userId: string, period: string) => {
  const filter: any = { userId };

  // Filter for today's wallet data
  if (period === 'today') {
    filter.createdAt = { $gte: startOfToday(), $lte: endOfDay(new Date()) };
  }

  const walletData = await Wallet.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        moneyAvailable: { $sum: '$moneyAvailable' },
        totalReceived: { $sum: '$totalReceived' },
        totalWithdrawn: { $sum: '$totalWithdrawn' },
      },
    },
  ]);

  return walletData.length > 0
    ? walletData[0]
    : { moneyAvailable: 0, totalReceived: 0, totalWithdrawn: 0 };
};

export const updateWalletEarnings = async (
  userId: string,
  earnings: number
) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of the day

    // Find wallet for the user
    const wallet = await Wallet.findOne({ userId });

    if (!wallet) {
      // If no wallet exists, create one
      return await Wallet.create({
        userId,
        moneyAvailable: earnings,
        availableToday: earnings,
        totalReceived: earnings,
      });
    }

    console.log(`Wallet found. Current state:`, wallet);

    // Update wallet fields
    wallet.moneyAvailable += earnings;
    wallet.totalReceived += earnings;

    // Update availableToday if the earnings are added today
    const isToday = wallet.updatedAt && wallet.updatedAt >= today;
    if (isToday) {
      wallet.availableToday += earnings;
    } else {
      wallet.availableToday = earnings;
    }

    await wallet.save();
  } catch (error) {
    console.error(`Failed to update wallet for user ${userId}:`, error);
    throw new Error('Could not update wallet');
  }
};
