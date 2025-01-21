import { Document, Types } from 'mongoose';

// Define the types using type literals
export type TaskType =
    | 'writing'
    | 'design'
    | 'development'
    | 'review'
    | 'video review'
    | 'marketing'
    | 'video editing'
    | 'data_analysis';

export type TaskStatus = 'pending' | 'in progress' | 'completed';
export type Currency = 'USD' | 'EUR' | 'GBP';
export type Location = 'remote' | 'onsite';

// File attachment interface
export interface ITaskFile {
    url: string;
    type: string;
    size: number;
}

// Compensation interface
export interface ITaskCompensation {
    amount: number;
    currency: Currency;
}

// Attachments interface
export interface ITaskAttachments {
    files: ITaskFile[];
    links: string[];
}

// Main task interface
export interface ITask extends Document {
    title: string;
    taskType: TaskType;
    description: string;
    requirements: string;
    location: Location;
    compensation: ITaskCompensation;
    deadline: Date;
    maxRespondents: number;
    attachments?: ITaskAttachments;
    status: TaskStatus;
    postedDate: Date;
    userId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

// Request DTO interface for task creation
export interface ICreateTaskDTO {
    title: string;
    taskType: TaskType;
    description: string;
    requirements: string;
    location?: Location;
    compensation: ITaskCompensation | string;
    deadline: string | Date;
    maxRespondents: string | number;
    links?: string[] | string;
}

// Query interface for filtered tasks
export interface ITaskFilters {
    datePosted?: 'today' | 'past_week' | 'past_month' | 'anytime';
    skills?: TaskType;
    applications?: string;
    taskPay?: '50-80' | '80-100' | '100-120' | '120-150' | '150-200' | 'above_200';
}