"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.editTask = exports.userTasks = exports.taskInfo = exports.deleteTask = exports.getAllTasks = exports.CreateTask = void 0;
const task_model_1 = __importDefault(require("../models/task.model"));
const fs_1 = __importDefault(require("fs"));
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const http_errors_1 = __importDefault(require("http-errors"));
const CreateTask = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { taskTitle, taskType, taskNumberofRespondent, taskDescription, taskLocation, taskCompensation, taskDeadline, taskRequirements, taskLinkUpload, taskLinkUploadTwo, } = request.body;
    let result;
    try {
        const userId = request.userId;
        if (!userId) {
            throw (0, http_errors_1.default)(409, "Not authenticated");
        }
        // if (!request.file) {
        //     throw createHttpError(409, "No file uploaded")
        // }
        if (request.file) {
            const path = (_a = request.file) === null || _a === void 0 ? void 0 : _a.path;
            result = yield cloudinary_1.default.uploader.upload(path);
        }
        //Upload image to cloudinary
        const newTask = new task_model_1.default({
            taskTitle,
            taskType,
            taskNumberofRespondent,
            taskDescription,
            taskLocation,
            taskCompensation,
            taskDeadline,
            taskRequirements,
            taskLinkUpload,
            taskLinkUploadTwo,
            taskImage: request.file ? result === null || result === void 0 ? void 0 : result.secure_url : "",
            cloudinary_id: request.file ? result === null || result === void 0 ? void 0 : result.public_id : "",
            authorId: userId
        });
        yield newTask.save();
        response.status(201).json({
            success: true,
            message: "Task Successfully created and saved",
            newTask
        });
    }
    catch (err) {
        next(err);
    }
});
exports.CreateTask = CreateTask;
const getAllTasks = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { page, limit, search } = request.query;
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 12;
        const skip = (pageNumber - 1) * limitNumber;
        let searchCriteria = {};
        if (search) {
            searchCriteria = {
                articleTitle: {
                    $regex: search,
                    $options: "i"
                }
            };
        }
        const totalTasks = yield task_model_1.default.countDocuments(searchCriteria);
        const allTasks = yield task_model_1.default.find(searchCriteria)
            .skip(skip)
            .limit(limitNumber)
            .sort({ updateAt: -1 });
        const totalPages = Math.ceil(totalTasks / limitNumber);
        response.status(200).json({
            success: true,
            message: "All tasks retrieved",
            allTasks: {
                tasks: allTasks,
                pagination: {
                    totalTasks,
                    currentPage: pageNumber,
                    totalPages,
                    pageSize: limitNumber
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllTasks = getAllTasks;
const deleteTask = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = request.userId;
        if (!userId) {
            response.status(403).json({
                success: false,
                message: "You are not authorized!"
            });
        }
        const task = yield task_model_1.default.findById(request.params.id);
        if (!task) {
            response.status(404).json({
                success: false,
                message: "Task not found!",
            });
        }
        yield task_model_1.default.findByIdAndDelete(request.params.id);
        response.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteTask = deleteTask;
const taskInfo = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const task = yield task_model_1.default.findById(request.params.id);
        response.status(200).json({
            success: true,
            message: "Article Found!",
            task
        });
    }
    catch (error) {
        next(error);
    }
});
exports.taskInfo = taskInfo;
const userTasks = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = request.userId;
    if (!userId) {
        throw (0, http_errors_1.default)(409, "No user found");
    }
    try {
        const userTasks = yield task_model_1.default.find({ authorId: userId });
        response.status(200).json({
            success: true,
            message: "User Tasks served",
            userTasks
        });
    }
    catch (error) {
        next(error);
    }
});
exports.userTasks = userTasks;
const editTask = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    const task = yield task_model_1.default.findById(request.params.id);
    //Delete the article image from cloudinary
    // await cloudinary.uploader.destroy(article.cloudinary_id);
    try {
        let result;
        if (request.file) {
            result = yield cloudinary_1.default.uploader.upload(request.file.path);
        }
        const data = {
            taskTitle: request.body.taskTitle || (task === null || task === void 0 ? void 0 : task.taskTitle),
            taskType: request.body.taskType || (task === null || task === void 0 ? void 0 : task.taskType),
            taskNumberofRespondent: request.body.taskNumberofRespondent || (task === null || task === void 0 ? void 0 : task.taskNumberofRespondent),
            taskDescription: request.body.taskDescription || (task === null || task === void 0 ? void 0 : task.taskDescription),
            taskLocation: request.body.taskDescription || (task === null || task === void 0 ? void 0 : task.taskDescription),
            taskCompensation: request.body.taskCompensation || (task === null || task === void 0 ? void 0 : task.taskCompensation),
            taskDeadline: request.body.taskDeadline || (task === null || task === void 0 ? void 0 : task.taskDeadline),
            taskRequirements: request.body.taskRequirements || (task === null || task === void 0 ? void 0 : task.taskRequirements),
            taskLinkUpload: request.body.taskLinkUpload || (task === null || task === void 0 ? void 0 : task.taskLinkUpload),
            taskLinkUploadTwo: request.body.taskLinkUploadTwo || (task === null || task === void 0 ? void 0 : task.taskLinkUploadTwo),
            taskImage: result === null || result === void 0 ? void 0 : result.secure_url,
            cloudinary_id: result === null || result === void 0 ? void 0 : result.public_id,
        };
        const editedTask = yield task_model_1.default.findByIdAndUpdate(request.params.id, data, { new: true });
        if (request.file) {
            fs_1.default.unlinkSync(request.file.path);
        }
        response.status(200).json({
            success: true,
            message: "Successfully edited the article",
            editedTask
        });
    }
    catch (error) {
        next(error);
    }
});
exports.editTask = editTask;
