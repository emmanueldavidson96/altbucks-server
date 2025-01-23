import { RequestHandler, Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import { Task } from "../models/task.model";

export const createTask: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Clean whitespace from field names
        const cleanBody: Record<string, any> = {};
        Object.keys(req.body).forEach(key => {
            cleanBody[key.trim()] = req.body[key];
        });

        const files = req.files as Express.Multer.File[];
        const processedFiles = files?.map(file => ({
            url: `/uploads/${file.filename}`,
            type: file.mimetype,
            size: file.size
        })) || [];

        const task = await Task.create({
            title: cleanBody['title'],
            taskType: cleanBody['taskType'],
            description: cleanBody['description'],
            requirements: cleanBody['requirements'],
            location: cleanBody['location'],
            maxRespondents: parseInt(cleanBody['maxRespondents']),
            deadline: new Date(cleanBody['deadline']),
            compensation: JSON.parse(cleanBody['compensation']),
            attachments: {
                files: processedFiles,
                links: JSON.parse(cleanBody['links'])
            },
            userId: req.userId
        });

        res.status(201).json({ success: true, task });
    } catch (error) {
        next(error);
    }
};


export const getAllTasks: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const page = +(request.query.page || 1);
        const limit = +(request.query.limit || 10);

        const [tasks, total] = await Promise.all([
            Task.find({ userId: request.userId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Task.countDocuments({ userId: request.userId })
        ]);

        response.json({
            tasks,
            pagination: { page, pages: Math.ceil(total / limit), total }
        });
    } catch (error) {
        next(error);
    }
};

export const getRecentTasks: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const tasks = await Task.find({ userId: request.userId })
            .sort({ createdAt: -1 })
            .limit(+(request.query.limit || 5));

        response.json({ tasks });
    } catch (error) {
        next(error);
    }
};

export const getTaskById: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const task = await Task.findOne({
            _id: request.params.id,
            userId: request.userId
        });

        if (!task) throw createHttpError(404, "Task not found");
        response.json({ task });
    } catch (error) {
        next(error);
    }
};

export const updateTask: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: request.params.id, userId: request.userId },
            { $set: request.body },
            { new: true, runValidators: true }
        );

        if (!task) throw createHttpError(404, "Task not found");
        response.json({ task });
    } catch (error) {
        next(error);
    }
};

export const deleteTask: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: request.params.id,
            userId: request.userId
        });

        if (!task) throw createHttpError(404, "Task not found");
        response.json({ message: "Task deleted" });
    } catch (error) {
        next(error);
    }
};

export const markTaskPending: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: request.params.id, userId: request.userId },
            { status: 'pending' },
            { new: true }
        );

        if (!task) throw createHttpError(404, "Task not found");
        response.json({ task });
    } catch (error) {
        next(error);
    }
};

export const markTaskComplete: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: request.params.id, userId: request.userId },
            { status: 'completed' },
            { new: true }
        );

        if (!task) throw createHttpError(404, "Task not found");
        response.json({ task });
    } catch (error) {
        next(error);
    }
};

export const getTasksByStatus: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { status } = request.params;
        if (!['pending', 'in progress', 'completed'].includes(status)) {
            throw createHttpError(400, "Invalid status");
        }

        const tasks = await Task.find({
            userId: request.userId,
            status
        }).sort({ createdAt: -1 });

        response.json({ tasks });
    } catch (error) {
        next(error);
    }
};

export const searchTasks: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const query = {
            userId: request.userId,
            ...(request.query.query && {
                $or: [
                    { title: { $regex: request.query.query, $options: 'i' } },
                    { description: { $regex: request.query.query, $options: 'i' } }
                ]
            }),
            ...(request.query.taskType && { taskType: request.query.taskType })
        };

        const tasks = await Task.find(query).sort({ createdAt: -1 });
        response.json({ tasks });
    } catch (error) {
        next(error);
    }
};

export const getUpcomingDeadlines: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const days = +(request.query.days || 7);
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

        response.json({ tasks });
    } catch (error) {
        next(error);
    }
};

export const getFilteredTasks: RequestHandler = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const { datePosted, skills, taskPay } = request.query;
        const query: Record<string, any> = { userId: request.userId };

        if (datePosted && datePosted !== 'anytime') {
            const date = new Date();
            switch(datePosted) {
                case 'today':
                    date.setHours(0, 0, 0, 0);
                    break;
                case 'past_week':
                    date.setDate(date.getDate() - 7);
                    break;
                case 'past_month':
                    date.setMonth(date.getMonth() - 1);
                    break;
            }
            query.createdAt = { $gte: date };
        }

        if (skills) query.taskType = skills;

        if (taskPay) {
            const ranges: Record<string, [number, number?]> = {
                '50-80': [50, 80],
                '80-100': [80, 100],
                '100-120': [100, 120],
                '120-150': [120, 150],
                '150-200': [150, 200],
                'above_200': [200]
            };

            const [min, max] = ranges[taskPay as string] || [];
            if (min) {
                query['compensation.amount'] = { $gte: min };
                if (max) query['compensation.amount'].$lte = max;
            }
        }

        const tasks = await Task.find(query).sort({ createdAt: -1 });
        response.json({ tasks, appliedFilters: { datePosted, skills, taskPay } });
    } catch (error) {
        next(error);
    }
};