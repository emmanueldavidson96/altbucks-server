import express from "express";
import * as Controller from "../controllers/user.controller";
import verifyToken from "../middlewares/verifyToken";
import upload from "../middlewares/multer";

const router = express.Router();

//Create a new Task Earner
router.post("/create-task-earner", Controller.SignupHandlerTaskEarner); // Done

//Create a new Task Creator
router.post("/create-task-creator", Controller.SignupHandlerTaskCreator)

//Login Task Earner/Task Creator
router.post("/login-user", Controller.LoginHandlerTaskEarner); // Done

//Verify User and Retrieve User Details
router.get("/user-profile", verifyToken, Controller.getUserProfile); // Done

//Edit user information
router.post("/update-userinfo", verifyToken, upload.single("userImageUrl"), Controller.UpdateUserHandler)

//Get all users - For Admin
router.get("/users", Controller.GetAllUsers);

//Get Users by Id
router.get("/user/:id", verifyToken, Controller.GetUserById)

//Logout Users
router.post("/logout-user", Controller.LogoutUserHandler);

//Request password reset
router.post("/forgot-password", Controller.RequestPasswordReset)

//Verify password reset token
router.post("/verify-token", Controller.VerifyResetToken)

//Reset Password
router.post("/reset-password", Controller.ResetPassword)


export default router