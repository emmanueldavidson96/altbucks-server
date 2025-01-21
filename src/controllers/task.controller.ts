import { RequestHandler, Request, Response, NextFunction } from "express";
import createHttpError from "http-errors";
import TaskModel from "../models/task.model";
import mongoose from "mongoose";

// Create Task Handler
export const createTaskHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, createdBy, type, platform, amount } = req.body;
  try {
    if (!title || !description || !createdBy || !type || !platform || amount === undefined) {
      throw createHttpError(400, "Missing required fields");
    }

    if (!mongoose.Types.ObjectId.isValid(createdBy)) {
      throw createHttpError(400, "Invalid user ID");
    }

    const task = await TaskModel.create({ title, description, createdBy, type, platform, amount });

    res.status(201).json({
      success: true,
      message: "Task created successfully!",
      task,
    });
  } catch (error) {
    next(error);
  }
};

// Get All Tasks Handler
export const getTasksHandler: RequestHandler = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tasks = await TaskModel.find().exec();
    res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully!",
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// Get Task by ID Handler
export const getTaskByIdHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw createHttpError(400, "Invalid Task ID");
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw createHttpError(404, "Task not found");
    }

    res.status(200).json({
      success: true,
      message: "Task retrieved successfully!",
      task,
    });
  } catch (error) {
    next(error);
  }
};

// Update Task Handler
export const updateTaskHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params;
  const updatedData = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw createHttpError(400, "Invalid Task ID");
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw createHttpError(404, "Task not found");
    }

    await task.updateOne(updatedData);
    res.status(200).json({
      success: true,
      message: "Task updated successfully!",
      task: { ...task.toObject(), ...updatedData },
    });
  } catch (error) {
    next(error);
  }
};

// Delete Task Handler
export const deleteTaskHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { taskId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw createHttpError(400, "Invalid Task ID");
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw createHttpError(404, "Task not found");
    }

    await task.deleteOne();
    res.status(200).json({
      success: true,
      message: "Task deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

// Get Tasks by User Handler
export const getUserTasksHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, "Invalid User ID");
    }

    const tasks = await TaskModel.find({ createdBy: userId });
    res.status(200).json({
      success: true,
      message: "User's tasks retrieved successfully!",
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

// Get User Task Stats Handler
export const getUserTaskStatsHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, "Invalid User ID");
    }

    const stats = await TaskModel.aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      message: "User's task statistics retrieved successfully!",
      stats,
    });
  } catch (error) {
    next(error);
  }
};

// Get Total Tasks Count Handler
export const getTotalTasksHandler: RequestHandler = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const totalTasks = await TaskModel.countDocuments();
    res.status(200).json({
      success: true,
      message: "Total tasks count retrieved successfully!",
      totalTasks,
    });
  } catch (error) {
    next(error);
  }
};

// Get User Total Earnings Handler
export const getUserTotalEarningsHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw createHttpError(400, "Invalid User ID");
    }

    const totalEarnings = await TaskModel.aggregate([
      { $match: { createdBy: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalEarnings: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      success: true,
      message: "User's total earnings retrieved successfully!",
      totalEarnings: totalEarnings[0]?.totalEarnings || 0,
    });
  } catch (error) {
    next(error);
  }
};

export const getTotalTasksInDateRangeHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate } = req.query;

  try {
    if (!startDate || !endDate) {
      throw createHttpError(400, "Start date and end date are required.");
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const totalTasks = await TaskModel.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });

    res.status(200).json({
      success: true,
      message: "Total tasks in the specified date range retrieved successfully!",
      totalTasks,
      startDate,
      endDate,
    });
  } catch (error) {
    next(error);
  }
};

export const getTotalApprovedTasksHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalApprovedTasks = await TaskModel.countDocuments({ status: "approved" });

    res.status(200).json({
      success: true,
      message: "Total approved tasks retrieved successfully!",
      totalApprovedTasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTotalEarningsInRangeHandler: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate } = req.query;

  try {
    if (!startDate || !endDate) {
      throw createHttpError(400, "Start date and end date are required.");
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const totalEarnings = await TaskModel.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, totalEarnings: { $sum: "$amount" } } },
    ]);

    res.status(200).json({
      success: true,
      message: "Total earnings in the specified date range retrieved successfully!",
      totalEarnings: totalEarnings[0]?.totalEarnings || 0,
      startDate,
      endDate,
    });
  } catch (error) {
    next(error);
  }
};


export const getTotalTasksInDateRange: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  const { startDate, endDate } = req.query;

  try {
    if (!startDate || !endDate) {
      throw createHttpError(400, "Start date and end date are required.");
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    const totalTasks = await TaskModel.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $count: "totalTasks" },
    ]);

    res.status(200).json({
      success: true,
      message: "Total tasks in the specified date range retrieved successfully!",
      totalTasks: totalTasks[0]?.totalTasks || 0,
      startDate,
      endDate,
    });
  } catch (error) {
    next(error);
  }
};