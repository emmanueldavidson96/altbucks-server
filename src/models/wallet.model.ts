import mongoose, { Schema, Document } from 'mongoose';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  moneyAvailable: number;
  availableToday: number;
  totalReceived: number;
  totalWithdrawn: number;
  createdAt?: Date; 
  updatedAt?: Date;
}

const WalletSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    moneyAvailable: { type: Number, default: 0, min: 0 },
    availableToday: { type: Number, default: 0, min: 0 },
    totalReceived: { type: Number, default: 0 , min: 0},
    totalWithdrawn: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IWallet>('Wallet', WalletSchema);
