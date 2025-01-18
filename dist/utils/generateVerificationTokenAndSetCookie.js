"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const validateEnv_1 = __importDefault(require("../utils/validateEnv"));
const generateTokenAndSetCookie = (response, userId) => {
    const token = jsonwebtoken_1.default.sign({ userId }, validateEnv_1.default.JWT_SECRET, {
        expiresIn: "7d"
    });
    response.cookie("altbucksToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return token;
};
exports.default = generateTokenAndSetCookie;
