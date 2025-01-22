import express from "express";
import * as Controller from "../controllers/task.controller";

const router = express.Router();

// Create a new Task
router.post("/create", Controller.createTaskHandler);

// Get all Tasks
router.get("/get", Controller.getTasksHandler);

// Get a Task by ID
router.get("/get/:taskId", Controller.getTaskByIdHandler);

// Update a Task by ID
router.put("/update/:taskId", Controller.updateTaskHandler);

// Delete a Task by ID
router.delete("/:taskId", Controller.deleteTaskHandler);

// Get all Tasks for a specific User
router.get("/user/:userId", Controller.getUserTasksHandler);

// Get Task Stats for a specific User
router.get("/user/:userId/stats", Controller.getUserTaskStatsHandler);

// Get total Tasks
router.get("/total", Controller.getTotalTasksHandler);

// Get total earnings for a specific User
router.get("/user/:userId/earnings", Controller.getUserTotalEarningsHandler);

// Get total Tasks within a Date Range
router.get("/date-range", Controller.getTotalTasksInDateRangeHandler);

// Get total approved Tasks
router.get("/total-approved", Controller.getTotalApprovedTasksHandler);

// Get total earnings within a Date Range
router.get("/total-earnings-range", Controller.getTotalEarningsInRangeHandler);

export default router;