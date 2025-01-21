import mongoose, { Schema, Document } from 'mongoose';

// Define the Task interface extending mongoose Document
export interface ITask extends Document {
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  status: 'pending' | 'completed' | 'cancelled' | 'under review' | 'approved';
  type: string;
  platform: string;
  amount: number;  // Reward for task
  performedAt?: Date;  // Date task was performed
}

// Define the Task schema
const TaskSchema: Schema<ITask> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,  // Remove leading/trailing spaces
    },
    description: {
      type: String,
      required: true,
      trim: true,  // Remove leading/trailing spaces
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,  // Optional field for task assignments
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'cancelled', 'under review', 'approved'],
      default: 'pending',  // Default task status
    },
    type: {
      type: String,
      required: true,  // Ensure task type is provided
    },
    platform: {
      type: String,
      required: true,  // Ensure platform is provided
    },
    amount: {
      type: Number,
      required: true,
      min: 0,  // Ensure amount is non-negative
    },
    performedAt: {
      type: Date,
      default: null,  // Set when task is completed
    },
  },
  {
    timestamps: true,  // Automatically handles `createdAt` and `updatedAt`
  }
);

// Create the Task model based on the schema
const TaskModel = mongoose.model<ITask>('Task', TaskSchema);

export default TaskModel;