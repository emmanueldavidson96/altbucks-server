import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface ICard extends Document {
  userId: mongoose.Types.ObjectId;
  cardNumber: string;
  expiryDate: Date;
  cardType: string; // e.g., MasterCard, Visa
}

const CardSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    cardNumber: { type: String, required: true },
    expiryDate: { type: String, required: true },
    cardType: { type: String, required: true },
  },
  { timestamps: true }
);



export default mongoose.model<ICard>('Card', CardSchema);
