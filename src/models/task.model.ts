import { Schema, model } from 'mongoose';

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
            ],
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
            values: ['remote', 'onsite'],
            message: '{VALUE} is not a valid location'
        },
        default: 'remote'
    },
    compensation: {
        amount: {
            type: Number,
            required: [true, 'Compensation amount is required'],
            min: [0, 'Compensation cannot be negative'],
            set: (v: string | number) => Number(v) || 0
        },
        currency: {
            type: String,
            enum: {
                values: ['USD', 'EUR', 'GBP'],
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
        },
        set: (v: string | Date) => new Date(v)
    },
    maxRespondents: {
        type: Number,
        required: [true, 'Maximum respondents is required'],
        min: [1, 'Must accept at least one respondent'],
        set: (v: string | number) => Number(v) || 1
    },
    attachments: {
        files: [{
            _id: false,
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
                min: [0, 'File size cannot be negative'],
                set: (v: string | number) => Number(v) || 0
            }
        }],
        links: [String]
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'in progress', 'completed'],
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
    timestamps: true
});

TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, postedDate: -1 });
TaskSchema.index({ userId: 1, taskType: 1 });
TaskSchema.index({ userId: 1, deadline: 1 });

export const Task = model('Task', TaskSchema);