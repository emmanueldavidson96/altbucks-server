
import mongoose from "mongoose";


const walletSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
      required: function (this: { walletType: string }) {
        return this.walletType === 'Creator';
      },
    },
    totalEarnings: {
      type: Number,
      default: 0,
      required: function (this: { walletType: string }) {
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
  
  export default  mongoose.model('Wallet', walletSchema);

  