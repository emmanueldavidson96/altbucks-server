import express from "express";
import * as Controller from "../controllers/task.controller";
import verifyToken from "../middlewares/verifyToken";
import upload from "../middlewares/multer";

const router = express.Router();

// Create new task
router.post("/create-task", verifyToken, upload.array('files', 5), Controller.createTask);

// Get all tasks with pagination
router.get("/tasks", verifyToken, Controller.getAllTasks);

// Get recent tasks
router.get("/recent-tasks", verifyToken, Controller.getRecentTasks);

// Search tasks
router.get("/search-tasks", verifyToken, Controller.searchTasks);

// Get tasks by status
router.get("/tasks-by-status/:status", verifyToken, Controller.getTasksByStatus);

// Get upcoming deadlines
router.get("/upcoming-tasks", verifyToken, Controller.getUpcomingDeadlines);

// Get specific task
router.get("/task/:id", verifyToken, Controller.getTaskById);

// Update task status
router.patch("/task-complete/:id", verifyToken, Controller.markTaskComplete);
router.patch("/task-pending/:id", verifyToken, Controller.markTaskPending);

// Update task
router.patch("/update-task/:id", verifyToken, upload.array('files', 5), Controller.updateTask);

// Delete task
router.delete("/delete-task/:id", verifyToken, Controller.deleteTask);

// tasks by filter
router.get('/filter', verifyToken, Controller.getFilteredTasks);

export default router;