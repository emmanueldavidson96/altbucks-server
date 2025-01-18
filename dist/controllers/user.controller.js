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
exports.LogoutUserHandler = exports.UpdateUserHandler = exports.GetAllUsers = exports.GetUserById = exports.getUserProfile = exports.LoginHandlerTaskEarner = exports.SignupHandlerTaskCreator = exports.SignupHandlerTaskEarner = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const user_model_1 = __importDefault(require("../models/user.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateVerificationTokenAndSetCookie_1 = __importDefault(require("../utils/generateVerificationTokenAndSetCookie"));
// Controller to Sign up Task Earner
const SignupHandlerTaskEarner = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, email, password, lastName, phoneNumber, confirmPassword } = request.body;
    try {
        if (!firstName || !email || !password || !lastName || !phoneNumber || !confirmPassword) {
            throw (0, http_errors_1.default)(400, "Parameters missing!");
        }
        const existingUser = yield user_model_1.default.findOne({
            email: email
        }).exec();
        if (existingUser) {
            throw (0, http_errors_1.default)(409, "Email already exists in the database!");
        }
        if (confirmPassword !== password) {
            throw (0, http_errors_1.default)(409, "confirm password!");
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = yield user_model_1.default.create({
            firstName: firstName,
            email: email,
            password: hashedPassword,
            lastName: lastName,
            phoneNumber: phoneNumber,
            confirmPassword: confirmPassword,
            isTaskEarner: true
        });
        (0, generateVerificationTokenAndSetCookie_1.default)(response, newUser._id);
        response.status(201).json({
            success: true,
            message: "Task Earner created!",
            newUser
        });
    }
    catch (error) {
        next(error);
    }
});
exports.SignupHandlerTaskEarner = SignupHandlerTaskEarner;
// Controller to Sign up Task Earner
const SignupHandlerTaskCreator = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { firstName, email, password, lastName, phoneNumber, confirmPassword } = request.body;
    try {
        if (!firstName || !email || !password || !lastName || !phoneNumber || !confirmPassword) {
            throw (0, http_errors_1.default)(400, "Parameters missing!");
        }
        const existingUser = yield user_model_1.default.findOne({
            email: email
        }).exec();
        if (existingUser) {
            throw (0, http_errors_1.default)(409, "Email already exists in the database!");
        }
        if (confirmPassword !== password) {
            throw (0, http_errors_1.default)(409, "confirm password!");
        }
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = yield user_model_1.default.create({
            firstName: firstName,
            email: email,
            password: hashedPassword,
            lastName: lastName,
            phoneNumber: phoneNumber,
            confirmPassword: confirmPassword,
            isTaskCreator: true
        });
        (0, generateVerificationTokenAndSetCookie_1.default)(response, newUser._id);
        response.status(201).json({
            success: true,
            message: "Task Creator created!",
            newUser
        });
    }
    catch (error) {
        next(error);
    }
});
exports.SignupHandlerTaskCreator = SignupHandlerTaskCreator;
//Controller to Login as task Earner
const LoginHandlerTaskEarner = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = request.body;
    try {
        if (!email || !password) {
            throw (0, http_errors_1.default)(409, "Missing parameters!");
        }
        const user = yield user_model_1.default.findOne({
            email: email
        });
        if (!user) {
            throw (0, http_errors_1.default)(409, "Invalid credentials");
        }
        const isPasswordMatched = yield bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordMatched) {
            throw (0, http_errors_1.default)(409, "Incorrect password");
        }
        (0, generateVerificationTokenAndSetCookie_1.default)(response, user._id);
        user.lastLogin = new Date();
        yield user.save();
        response.status(201).json({
            success: true,
            message: "Task Earner logged In! ",
            user
        });
    }
    catch (error) {
        next(error);
    }
});
exports.LoginHandlerTaskEarner = LoginHandlerTaskEarner;
//Controlller to Get User Profile for Dashboard
const getUserProfile = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.default.findById(request.userId).select("-password");
        if (!user) {
            throw (0, http_errors_1.default)(409, "User not found");
        }
        response.status(201).json({
            success: true,
            message: "User profile details retrieved",
            user
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserProfile = getUserProfile;
// Get User Information by ID
const GetUserById = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = request.params;
    try {
        const user = yield user_model_1.default.findById(id).select("-password");
        if (!user) {
            throw (0, http_errors_1.default)(409, "User with this id not found!");
        }
        response.status(201).json({
            success: true,
            message: "User profile retrieved!",
            user
        });
    }
    catch (error) {
        next(error);
    }
});
exports.GetUserById = GetUserById;
//Get All Users within the database
const GetAllUsers = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield user_model_1.default.find().select("-password").exec();
        if (!users) {
            throw (0, http_errors_1.default)(409, "Users not found!");
        }
        response.status(201).json({
            success: true,
            message: "Users retrieved!",
            users
        });
    }
    catch (error) {
        next(error);
    }
});
exports.GetAllUsers = GetAllUsers;
//Update User Profile
const UpdateUserHandler = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
    }
    catch (error) {
        next(error);
    }
});
exports.UpdateUserHandler = UpdateUserHandler;
// Logout User
const LogoutUserHandler = (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        response.clearCookie("altbucksToken");
        response.status(201).json({
            success: true,
            message: "User logged out!"
        });
    }
    catch (error) {
        next(error);
    }
});
exports.LogoutUserHandler = LogoutUserHandler;
