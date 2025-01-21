import { Router } from "express";
import {
    createTaskHandler,
    getTasksHandler,
    getTaskByIdHandler,
    updateTaskHandler,
    deleteTaskHandler,
    getUserTasksHandler,
    getUserTaskStatsHandler,
    getTotalTasksHandler,
    getUserTotalEarningsHandler,
    getTotalTasksInDateRangeHandler,
    getTotalApprovedTasksHandler,
    getTotalEarningsInRangeHandler
} from "../controllers/task.controller"

const router = Router();

router.post("/create", createTaskHandler);
router.get("/get", getTasksHandler);
router.get("/get/:taskId", getTaskByIdHandler);
router.put("/update/:taskId", updateTaskHandler);
router.delete("/:taskId", deleteTaskHandler);
router.get("/user/:userId", getUserTasksHandler);
router.get("/user/:userId/stats", getUserTaskStatsHandler);
router.get("/total", getTotalTasksHandler);
router.get("/user/:userId/earnings", getUserTotalEarningsHandler);
router.get("/date-range", getTotalTasksInDateRangeHandler);
router.get("/total-approved", getTotalApprovedTasksHandler);
router.get("/total-earnings-range", getTotalEarningsInRangeHandler);

export default router;