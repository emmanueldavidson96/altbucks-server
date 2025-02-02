"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyToken_1 = __importDefault(require("../middlewares/verifyToken"));
const Controller = __importStar(require("../controllers/task.controller"));
const multer_1 = __importDefault(require("../middlewares/multer"));
const router = express_1.default.Router();
//Task creator creates a new task
router.post("/create-task", verifyToken_1.default, multer_1.default.single("taskImage"), Controller.CreateTask);
//Task creator update task
router.put("/update-task/:id", verifyToken_1.default, multer_1.default.single("taskImage"), Controller.editTask);
//Task creator delete task
router.delete("/delete-task/:id", verifyToken_1.default, Controller.deleteTask);
//Task Detail
router.get("/task/:id", Controller.taskInfo);
//All Tasks
router.get("/tasks", Controller.getAllTasks);
//All Tasks Created by Logged in Task Creator
router.get("/tasks/user", verifyToken_1.default, Controller.userTasks);
exports.default = router;
