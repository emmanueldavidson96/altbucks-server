import { RequestHandler, Response, Request, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "../models/user.model";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../utils/generateVerificationTokenAndSetCookie";


interface SignUpBody{
    firstName?:string,
    email?:string,
    password?:string, 
    lastName?:string,
    phoneNumber?:string,
    confirmPassword?:string,
}

// Controller to Sign up Task Earner
export const SignupHandlerTaskEarner:RequestHandler = async (request:Request, response:Response, next:NextFunction) => {
    const {firstName, email, password, lastName, phoneNumber, confirmPassword} = request.body;
    try{
        if(!firstName || !email || !password || !lastName || !phoneNumber || !confirmPassword){
            throw createHttpError(400, "Parameters missing!")
        }
        const existingUser = await userModel.findOne({
            email:email
        }).exec();
        if(existingUser){
            throw createHttpError(409, "Email already exists in the database!");
        } 
        if(confirmPassword !== password){
            throw createHttpError(409, "confirm password!")
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await userModel.create({
            firstName:firstName,
            email:email,
            password:hashedPassword,
            lastName:lastName,
            phoneNumber: phoneNumber,
            confirmPassword:confirmPassword,
            isTaskEarner:true,
        })
        generateTokenAndSetCookie(response, newUser._id);
        response.status(201).json({
            success:true,
            message:"Task Earner created!",
            newUser
        })
    }catch(error){
        next(error)
    }
}


// Controller to Sign up Task Earner
export const SignupHandlerTaskCreator:RequestHandler = async (request:Request, response:Response, next:NextFunction) => {
    const {firstName, email, password, lastName, phoneNumber, confirmPassword} = request.body;
    try{
        if(!firstName || !email || !password || !lastName || !phoneNumber || !confirmPassword){
            throw createHttpError(400, "Parameters missing!")
        }
        const existingUser = await userModel.findOne({
            email:email
        }).exec();
        if(existingUser){
            throw createHttpError(409, "Email already exists in the database!");
        } 
        if(confirmPassword !== password){
            throw createHttpError(409, "confirm password!")
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await userModel.create({
            firstName:firstName,
            email:email,
            password:hashedPassword,
            lastName:lastName,
            phoneNumber: phoneNumber,
            confirmPassword:confirmPassword,
            isTaskCreator:true
        })
        generateTokenAndSetCookie(response, newUser._id);
        response.status(201).json({
            success:true,
            message:"Task Creator created!",
            newUser
        })
    }catch(error){
        next(error)
    }
}

interface LoginBody{
    email?:string,
    password?:string
}

//Controller to Login as task Earner
export const LoginHandlerTaskEarner:RequestHandler = async (request:Request, response:Response, next:NextFunction) => {
    const {email, password} = request.body;
    try{
        if(!email || !password){
            throw createHttpError(409, "Missing parameters!")
        }
        const user = await userModel.findOne({
            email:email
        })
        if(!user){
            throw createHttpError(409, "Invalid credentials")
        }
        
        const isPasswordMatched = await bcrypt.compare(password, user.password)
        if(!isPasswordMatched){
            throw createHttpError(409, "Incorrect password")
        }
        generateTokenAndSetCookie(response, user._id);
        user.lastLogin = new Date();
        await user.save()
        response.status(201).json({
            success:true,
            message:"Task Earner logged In! ",
            user
        })
    }catch(error){
        next(error)
    }
}

//Controlller to Get User Profile for Dashboard
export const getUserProfile:RequestHandler = async (request:Request, response:Response, next:NextFunction) => {
    try{
        const user = await userModel.findById(request.userId).select("-password");
        if(!user){
            throw createHttpError(409, "User not found")
        }
        response.status(201).json({
            success:true,
            message:"User profile details retrieved",
            user
        })
    }
    catch(error){
        next(error)
    }
}

// Get User Information by ID
export const GetUserById:RequestHandler = async (request:Request, response:Response, next:NextFunction) => {
    const {id} = request.params;
    try{
        const user = await userModel.findById(id).select("-password");
        if(!user){
            throw createHttpError(409, "User with this id not found!");
        }
        response.status(201).json({
            success:true,
            message:"User profile retrieved!",
            user
        })
    }catch(error){
        next(error)
    }
}

//Get All Users within the database
export const GetAllUsers:RequestHandler = async (request:Request, response:Response, next:NextFunction) => {
    try{
        const users = await userModel.find().select("-password").exec();
        if(!users){
            throw createHttpError(409, "Users not found!")
        }
        response.status(201).json({
            success:true,
            message:"Users retrieved!",
            users
        })
    }catch(error){
        next(error)
    }
}

//Update User Profile
export const UpdateUserHandler:RequestHandler = async (request:Request, response:Response, next:NextFunction) => {
    try{

    }catch(error){
        next(error)
    }

}


// Logout User
export const LogoutUserHandler:RequestHandler = async (request:Request, response:Response, next:NextFunction) => {
    try{
        response.clearCookie("altbucksToken");
        response.status(201).json({
            success:true,
            message:"User logged out!"
        })
    }catch(error){
        next(error)
    }
}