"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const walletSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    availableBalance: {
        type: Number,
        default: 0,
    },
    totalDeposits: {
        type: Number,
        default: 0,
        required: function () {
            return this.walletType === 'Creator';
        },
    },
    totalEarnings: {
        type: Number,
        default: 0,
        required: function () {
            return this.walletType === 'Earner';
        },
    },
    totalWithdrawals: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.model('Wallet', walletSchema);
