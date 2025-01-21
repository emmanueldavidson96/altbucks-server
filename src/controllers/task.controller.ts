import { RequestHandler } from "express";
import createHttpError from "http-errors";
import { Task } from "../models/task.model";

// Create Task
export const createTask: RequestHandler = async (req: any, res, next) => {
    try {
        // Validate required fields
        const requiredFields = ['taskType', 'description', 'requirements', 'maxRespondents', 'deadline'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            throw createHttpError(400, `Missing required fields: ${missingFields.join(', ')}`);
        }

        // Handle file uploads
        const files = req.files as Express.Multer.File[];
        const processedFiles = files?.map(file => ({
            url: `/uploads/${file.filename}`,
            type: file.mimetype,
            size: file.size
        })) ?? [];

        // Parse compensation (it will be a string in multipart/form-data)
        let compensation;
        try {
            compensation = typeof req.body.compensation === 'string'
                ? JSON.parse(req.body.compensation)
                : req.body.compensation;

            if (!compensation?.amount) {
                throw createHttpError(400, "Compensation amount is required");
            }
        } catch (error) {
            throw createHttpError(400, "Invalid compensation format. Expected JSON string");
        }

        // Parse links (will be a string in multipart/form-data)
        let links: string[] = [];
        try {
            links = req.body.links ? JSON.parse(req.body.links) : [];
        } catch (error) {
            throw createHttpError(400, "Invalid links format. Expected JSON array");
        }

        // Create task
        const task = await Task.create({
            title: req.body.title,
            taskType: req.body.taskType,
            description: req.body.description,
            requirements: req.body.requirements,
            location: req.body.location || 'remote',
            compensation: {
                amount: Number(compensation.amount),
                currency: compensation.currency || 'USD'
            },
            deadline: new Date(req.body.deadline),
            maxRespondents: parseInt(req.body.maxRespondents),
            attachments: {
                files: processedFiles,
                links
            },
            userId: req.userId,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            task
        });

    } catch (error: any) {
        if (error.name === 'ValidationError') {
            next(createHttpError(400, error.message));
            return;
        }
        next(error);
    }
};
// Get All Tasks with pagination
export const getAllTasks: RequestHandler = async (req: any, res, next) => {
    try {
        const page = +(req.query.page || 1);
        const limit = +(req.query.limit || 10);

        const [tasks, total] = await Promise.all([
            Task.find({ userId: req.userId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit),
            Task.countDocuments({ userId: req.userId })
        ]);

        res.json({
            tasks,
            pagination: { page, pages: Math.ceil(total / limit), total }
        });
    } catch (error) {
        next(error);
    }
};

// Get Recent Tasks
export const getRecentTasks: RequestHandler = async (req: any, res, next) => {
    try {
        const tasks = await Task.find({ userId: req.userId })
            .sort({ createdAt: -1 })
            .limit(+(req.query.limit || 5));

        res.json({ tasks });
    } catch (error) {
        next(error);
    }
};

// Get Task by ID
export const getTaskById: RequestHandler = async (req: any, res, next) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            userId: req.userId
        });

        if (!task) throw createHttpError(404, "Task not found");
        res.json({ task });
    } catch (error) {
        next(error);
    }
};

// Update Task
export const updateTask: RequestHandler = async (req: any, res, next) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!task) throw createHttpError(404, "Task not found");
        res.json({ task });
    } catch (error) {
        next(error);
    }
};

// Delete Task
export const deleteTask: RequestHandler = async (req: any, res, next) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });

        if (!task) throw createHttpError(404, "Task not found");
        res.json({ message: "Task deleted" });
    } catch (error) {
        next(error);
    }
};

// Mark Task as Pending
export const markTaskPending: RequestHandler = async (req: any, res, next) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { status: 'pending' },
            { new: true }
        );

        if (!task) throw createHttpError(404, "Task not found");
        res.json({ task });
    } catch (error) {
        next(error);
    }
};

// Mark Task as Complete
export const markTaskComplete: RequestHandler = async (req: any, res, next) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            { status: 'completed' },
            { new: true }
        );

        if (!task) throw createHttpError(404, "Task not found");
        res.json({ task });
    } catch (error) {
        next(error);
    }
};

// Get Tasks by Status
export const getTasksByStatus: RequestHandler = async (req: any, res, next) => {
    try {
        const { status } = req.params;
        if (!['pending', 'in progress', 'completed'].includes(status)) {
            throw createHttpError(400, "Invalid status");
        }

        const tasks = await Task.find({
            userId: req.userId,
            status
        }).sort({ createdAt: -1 });

        res.json({ tasks });
    } catch (error) {
        next(error);
    }
};

// Search Tasks
export const searchTasks: RequestHandler = async (req: any, res, next) => {
    try {
        const query = {
            userId: req.userId,
            ...(req.query.query && {
                $or: [
                    { title: { $regex: req.query.query, $options: 'i' } },
                    { description: { $regex: req.query.query, $options: 'i' } }
                ]
            }),
            ...(req.query.taskType && { taskType: req.query.taskType })
        };

        const tasks = await Task.find(query).sort({ createdAt: -1 });
        res.json({ tasks });
    } catch (error) {
        next(error);
    }
};

// Get Upcoming Deadlines
export const getUpcomingDeadlines: RequestHandler = async (req: any, res, next) => {
    try {
        const days = +(req.query.days || 7);
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + days);

        const tasks = await Task.find({
            userId: req.userId,
            deadline: {
                $gte: new Date(),
                $lte: futureDate
            },
            status: { $ne: 'completed' }
        }).sort({ deadline: 1 });

        res.json({ tasks });
    } catch (error) {
        next(error);
    }
};

// Get Filtered Tasks
export const getFilteredTasks: RequestHandler = async (req: any, res, next) => {
    try {
        const { datePosted, skills, taskPay } = req.query;
        const query: Record<string, any> = { userId: req.userId };

        // Date filter
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

        // Skills filter
        if (skills) query.taskType = skills;

        // Payment range filter
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
        res.json({ tasks, appliedFilters: { datePosted, skills, taskPay } });
    } catch (error) {
        next(error);
    }
};