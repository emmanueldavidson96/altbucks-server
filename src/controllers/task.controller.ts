import { RequestHandler, Response, Request, NextFunction } from "express";
import createHttpError from "http-errors";
import { Task } from "../models/task.model";

interface CreateTaskBody {
    title?: string;
    taskType?: string;
    description?: string;
    requirements?: string;
    location?: string;
    compensation?: {
        amount: number;
        currency: string;
    };
    deadline?: Date;
    maxRespondents?: number;
    attachments?: {
        files: Array<{
            url: string;
            type: string;
            size: number;
        }>;
        links: string[];
    };
}

// Controller to create a new task
export const createTask: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    const { title, taskType, description, requirements, location, compensation, deadline, maxRespondents, attachments } = request.body;
    try {
        // Check required fields
        if (!title || !taskType || !description || !requirements || !compensation || !deadline || !maxRespondents) {
            throw createHttpError(400, "Required parameters missing!");
        }

        const newTask = await Task.create({
            title,
            taskType,
            description,
            requirements,
            location,
            compensation,
            deadline,
            maxRespondents,
            attachments,
            userId: request.userId, // From verifyToken middleware
            status: 'pending'
        });

        response.status(201).json({
            success: true,
            message: "Task created successfully!",
            task: newTask
        });
    } catch (error) {
        next(error);
    }
};

// Controller to get all tasks with pagination
export const getAllTasks: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const page = parseInt(request.query.page as string) || 1;
        const limit = parseInt(request.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const tasks = await Task.find({ userId: request.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalTasks = await Task.countDocuments({ userId: request.userId });

        response.status(200).json({
            success: true,
            message: "Tasks retrieved successfully!",
            tasks,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalTasks / limit),
                totalTasks
            }
        });
    } catch (error) {
        next(error);
    }
};

// Controller to get recent tasks
export const getRecentTasks: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const limit = parseInt(request.query.limit as string) || 5;

        const tasks = await Task.find({ userId: request.userId })
            .sort({ createdAt: -1 })
            .limit(limit);

        response.status(200).json({
            success: true,
            message: "Recent tasks retrieved successfully!",
            tasks
        });
    } catch (error) {
        next(error);
    }
};

// Controller to search tasks
export const searchTasks: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { query, taskType } = request.query;
        const searchConditions: any = { userId: request.userId };

        if (query) {
            searchConditions.$or = [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }

        if (taskType) {
            searchConditions.taskType = taskType;
        }

        const tasks = await Task.find(searchConditions)
            .sort({ createdAt: -1 });

        response.status(200).json({
            success: true,
            message: "Tasks searched successfully!",
            tasks
        });
    } catch (error) {
        next(error);
    }
};

// Controller to get tasks by status
export const getTasksByStatus: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    const { status } = request.params;
    try {
        if (!['pending', 'in progress', 'completed'].includes(status)) {
            throw createHttpError(400, "Invalid status parameter!");
        }

        const tasks = await Task.find({
            userId: request.userId,
            status: status
        }).sort({ createdAt: -1 });

        response.status(200).json({
            success: true,
            message: `${status} tasks retrieved successfully!`,
            tasks
        });
    } catch (error) {
        next(error);
    }
};

// Controller to get upcoming deadlines
export const getUpcomingDeadlines: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const days = parseInt(request.query.days as string) || 7;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const tasks = await Task.find({
            userId: request.userId,
            deadline: {
                $gte: new Date(),
                $lte: futureDate
            },
            status: { $ne: 'completed' }
        }).sort({ deadline: 1 });

        response.status(200).json({
            success: true,
            message: "Upcoming deadline tasks retrieved successfully!",
            tasks
        });
    } catch (error) {
        next(error);
    }
};

// Controller to update task
export const updateTask: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;
    try {
        const task = await Task.findOne({ _id: id, userId: request.userId });

        if (!task) {
            throw createHttpError(404, "Task not found!");
        }

        const updatedTask = await Task.findByIdAndUpdate(
            id,
            { $set: request.body },
            { new: true, runValidators: true }
        );

        response.status(200).json({
            success: true,
            message: "Task updated successfully!",
            task: updatedTask
        });
    } catch (error) {
        next(error);
    }
};

// Controller to delete task
export const deleteTask: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;
    try {
        const task = await Task.findOneAndDelete({ _id: id, userId: request.userId });

        if (!task) {
            throw createHttpError(404, "Task not found!");
        }

        response.status(200).json({
            success: true,
            message: "Task deleted successfully!",
            task
        });
    } catch (error) {
        next(error);
    }
};


// Controller to get task by ID
export const getTaskById: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;
    try {
        const task = await Task.findOne({ _id: id, userId: request.userId });
        if (!task) {
            throw createHttpError(404, "Task not found!");
        }

        response.status(200).json({
            success: true,
            message: "Task retrieved successfully!",
            task
        });
    } catch (error) {
        next(error);
    }
};


// Controller to mark task as pending
export const markTaskPending: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;
    try {
        const task = await Task.findOneAndUpdate(
            { _id: id, userId: request.userId },
            { status: 'pending' },
            { new: true }
        );

        if (!task) {
            throw createHttpError(404, "Task not found!");
        }

        response.status(200).json({
            success: true,
            message: "Task marked as pending!",
            task
        });
    } catch (error) {
        next(error);
    }
};

// Controller to mark task as complete
export const markTaskComplete: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    const { id } = request.params;
    try {
        const task = await Task.findOneAndUpdate(
            { _id: id, userId: request.userId },
            { status: 'completed' },
            { new: true }
        );

        if (!task) {
            throw createHttpError(404, "Task not found!");
        }

        response.status(200).json({
            success: true,
            message: "Task marked as complete!",
            task
        });
    } catch (error) {
        next(error);
    }
};