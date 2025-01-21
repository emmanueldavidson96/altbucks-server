import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  userId: string;
  earnings: number;
  date: Date;
}

const TaskSchema: Schema = new Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    earnings: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);
