import express from "express";
import verifyToken from "../middlewares/verifyToken";
import * as Controller from "../controllers/task.controller"
import upload from "../middlewares/multer";

const router = express.Router();

//Task creator creates a new task
router.post("/create-task", verifyToken, upload.single("taskImage"), Controller.CreateTask )

//Task creator update task
router.put("/update-task/:id", verifyToken, upload.single("taskImage"), Controller.editTask )

//Task creator delete task
router.delete("/delete-task/:id", verifyToken, Controller.deleteTask)

//Task Detail
router.get("/task/:id", Controller.taskInfo)

//All Tasks
router.get("/tasks", Controller.getAllTasks)

//All Tasks Created by Logged in Task Creator
router.get("/tasks/user", verifyToken, Controller.userTasks)



export default router