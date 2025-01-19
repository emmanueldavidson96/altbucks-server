import {Request, Response} from "express";
import mongoose from "mongoose";

import walletModel from "../models/wallet.model";
import userModel from "../models/user.model";

export const deductMoneyFromWallet = async (userId: string, amount: number) => {
    try {
        
        const user = await userModel.findById(userId);
    if (!user) throw new Error("User not found.");

    const wallet = await walletModel.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found for the specified user.");


    if (user.isTaskCreator){
        wallet.availableBalance -= amount;
        wallet.totalWithdrawals += amount;
    }else if (user.isTaskEarner) {
        wallet.availableBalance -= amount;
        wallet.totalWithdrawals += amount;
      } else {
        throw new Error("User is neither a Task Creator nor a Task Earner.");
      }


        await wallet.save();

        console.log(`Successfully deducted ${amount} from userId: ${userId}`);

        return wallet; 
    } catch (error) {
        console.error('Error deducting money from wallet:', error);
        throw error; 
    }
}

export const addToWallet = async (userId: string, amount: number) => {
  try {
    
    const user = await userModel.findById(userId);
    if (!user) throw new Error("User not found.");

    
    const wallet = await walletModel.findOne({ userId });
    if (!wallet) throw new Error("Wallet not found for the specified user.");

    
    if (user.isTaskCreator) {
      wallet.availableBalance += amount;
      wallet.totalDeposits += amount;
    } else if (user.isTaskEarner) {
      wallet.availableBalance += amount;
      wallet.totalEarnings += amount;
    } else {
      throw new Error("User is neither a Task Creator nor a Task Earner.");
    }

    await wallet.save();
  } catch (error) {
    console.error("Error adding money to wallet:", error);
    throw error;
  }
}

export const WalletInformationHandler = async (req: Request, res: Response) => {
    const userId = req.userId as string;

    try {
        if (!userId) {
            res.status(400).json({ message: "User ID is required." });
            return ;
        }

        const user = await userModel.findById(userId)
        console.log('User from database:', user);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return ;
        }

        const wallet = await walletModel.findOne({ userId });
        if (!wallet) {
            res.status(404).json({ message: "Wallet not found." });
            return ;
        }

        if (user.isTaskCreator) {
            res.status(200).json({
                availableBalance: wallet.availableBalance,
                totalDepositBalance: wallet.totalDeposits,
                totalWithdrawBalance: wallet.totalWithdrawals,
            });
            return ;
        }

        if (user.isTaskEarner) {
             res.status(200).json({
                availableBalance: wallet.availableBalance,
                totalEarnsBalance: wallet.totalEarnings,
                totalWithdrawBalance: wallet.totalWithdrawals,
            });
            return;
        }

         res.status(400).json({
            message: "Invalid user type. User should be either Task Creator or Task Earner.",
        });

    } catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({
            message: "An unexpected error occurred. Please try again later.",
        });
    }
};

