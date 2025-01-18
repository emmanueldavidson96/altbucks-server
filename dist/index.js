"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const validateEnv_1 = __importDefault(require("./utils/validateEnv"));
const app_1 = __importDefault(require("./app"));
const connectDB_1 = require("./db/connectDB");
app_1.default.listen(validateEnv_1.default.PORT, () => {
    (0, connectDB_1.connectDB)();
    console.log(`Application is running at port ${validateEnv_1.default.PORT}`);
});
