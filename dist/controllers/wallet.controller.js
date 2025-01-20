"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletInformationHandler = exports.addToWallet = exports.deductMoneyFromWallet = void 0;
const wallet_model_1 = __importDefault(require("../models/wallet.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const deductMoneyFromWallet = (userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(userId);
        if (!user)
            throw new Error("User not found.");
        const wallet = yield wallet_model_1.default.findOne({ userId });
        if (!wallet)
            throw new Error("Wallet not found for the specified user.");
        if (user.isTaskCreator) {
            wallet.availableBalance -= amount;
            wallet.totalWithdrawals += amount;
        }
        else if (user.isTaskEarner) {
            wallet.availableBalance -= amount;
            wallet.totalWithdrawals += amount;
        }
        else {
            throw new Error("User is neither a Task Creator nor a Task Earner.");
        }
        yield wallet.save();
        console.log(`Successfully deducted ${amount} from userId: ${userId}`);
        return wallet;
    }
    catch (error) {
        console.error('Error deducting money from wallet:', error);
        throw error;
    }
});
exports.deductMoneyFromWallet = deductMoneyFromWallet;
const addToWallet = (userId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(userId);
        if (!user)
            throw new Error("User not found.");
        const wallet = yield wallet_model_1.default.findOne({ userId });
        if (!wallet)
            throw new Error("Wallet not found for the specified user.");
        if (user.isTaskCreator) {
            wallet.availableBalance += amount;
            wallet.totalDeposits += amount;
        }
        else if (user.isTaskEarner) {
            wallet.availableBalance += amount;
            wallet.totalEarnings += amount;
        }
        else {
            throw new Error("User is neither a Task Creator nor a Task Earner.");
        }
        yield wallet.save();
    }
    catch (error) {
        console.error("Error adding money to wallet:", error);
        throw error;
    }
});
exports.addToWallet = addToWallet;
const WalletInformationHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    try {
        if (!userId) {
            res.status(400).json({ message: "User ID is required." });
            return;
        }
        const user = yield user_model_1.default.findById(userId);
        console.log('User from database:', user);
        if (!user) {
            res.status(404).json({ message: "User not found." });
            return;
        }
        const wallet = yield wallet_model_1.default.findOne({ userId });
        if (!wallet) {
            res.status(404).json({ message: "Wallet not found." });
            return;
        }
        if (user.isTaskCreator) {
            res.status(200).json({
                availableBalance: wallet.availableBalance,
                totalDepositBalance: wallet.totalDeposits,
                totalWithdrawBalance: wallet.totalWithdrawals,
            });
            return;
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
    }
    catch (error) {
        console.error("Error occurred:", error);
        res.status(500).json({
            message: "An unexpected error occurred. Please try again later.",
        });
    }
});
exports.WalletInformationHandler = WalletInformationHandler;
