"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateEnv_1 = __importDefault(require("../utils/validateEnv"));
const verifyToken = (request, response, next) => {
    const token = request.cookies.altbucksToken;
    if (!token) {
        throw (0, http_errors_1.default)(409, "No token found!");
    }
    try {
        const decodedToken = jsonwebtoken_1.default.verify(token, validateEnv_1.default.JWT_SECRET);
        if (!decodedToken) {
            throw (0, http_errors_1.default)(409, "Something wrong with user token");
        }
        request.userId = decodedToken.userId;
        next();
    }
    catch (error) {
        console.error(error);
    }
};
exports.default = verifyToken;
