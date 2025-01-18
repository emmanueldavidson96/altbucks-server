"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
const validateEnv_1 = __importDefault(require("../utils/validateEnv"));
const port = validateEnv_1.default.PORT;
const connectDB = () => {
    try {
        mongoose_1.default.connect(validateEnv_1.default.MONGO_URI).then(() => {
            console.log(`MongoDB connected!`);
        }).catch((err) => {
            console.error(err);
        });
    }
    catch (err) {
        console.log(err);
    }
};
exports.connectDB = connectDB;
