"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const taskSchema = new mongoose_1.default.Schema({
    authorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User"
    },
    taskTitle: {
        type: String,
        required: true
    },
    taskType: {
        type: String,
        required: true
    },
    taskNumberofRespondent: {
        type: Number,
        required: true
    },
    taskDescription: {
        type: String,
        required: true
    },
    taskLocation: {
        type: String
    },
    taskCompensation: {
        type: Number,
        required: true
    },
    taskDeadline: {
        type: Number,
        required: true
    },
    taskRequirements: {
        type: String,
        required: true,
    },
    taskLinkUpload: {
        type: String,
        default: ""
    },
    taskLinkUploadTwo: {
        type: String,
        default: ""
    },
    taskImage: {
        type: String,
    },
    cloudinary_id: {
        type: String,
    },
}, {
    timestamps: true
});
exports.default = mongoose_1.default.model("Task", taskSchema);
