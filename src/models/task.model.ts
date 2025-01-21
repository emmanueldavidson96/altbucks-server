import { Schema, model } from 'mongoose';
import { ITask, TaskType, TaskStatus, Currency, Location } from '../@types/task';

const TaskSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    taskType: {
        type: String,
        required: [true, 'Task type is required'],
        enum: {
            values: [
                'writing',
                'design',
                'development',
                'review',
                'video review',
                'marketing',
                'video editing',
                'data_analysis'
            ] as TaskType[],
            message: '{VALUE} is not a valid task type'
        }
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    requirements: {
        type: String,
        required: [true, 'Requirements are required'],
        trim: true
    },
    location: {
        type: String,
        enum: {
            values: ['remote', 'onsite'] as Location[],
            message: '{VALUE} is not a valid location'
        },
        default: 'remote'
    },
    compensation: {
        amount: {
            type: Number,
            required: [true, 'Compensation amount is required'],
            min: [0, 'Compensation cannot be negative']
        },
        currency: {
            type: String,
            enum: {
                values: ['USD', 'EUR', 'GBP'] as Currency[],
                message: '{VALUE} is not a valid currency'
            },
            default: 'USD'
        }
    },
    deadline: {
        type: Date,
        required: [true, 'Deadline is required'],
        validate: {
            validator: function(value: Date) {
                return value > new Date();
            },
            message: 'Deadline must be a future date'
        }
    },
    maxRespondents: {
        type: Number,
        required: [true, 'Maximum respondents is required'],
        min: [1, 'Must accept at least one respondent']
    },
    attachments: {
        files: [{
            url: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
            size: {
                type: Number,
                required: true,
                min: [0, 'File size cannot be negative']
            }
        }],
        links: [String]
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'in progress', 'completed'] as TaskStatus[],
            message: '{VALUE} is not a valid status'
        },
        default: 'pending'
    },
    postedDate: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
        index: true
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Add compound indexes for common queries
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, postedDate: -1 });
TaskSchema.index({ userId: 1, taskType: 1 });
TaskSchema.index({ userId: 1, deadline: 1 });

export const Task = model<ITask>('Task', TaskSchema);