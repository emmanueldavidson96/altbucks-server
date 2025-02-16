import { NextFunction, Request, Response } from "express";
import userModel from "../models/user.model";
import createHttpError from "http-errors";

const isTaskCreator = async (request:Request, response:Response, next:NextFunction) => {
    try{
        const user = await userModel.findById(request.userId);
        if(!user){
            throw createHttpError(409, "User not found");
        }
        if (!user.isTaskCreator){
            throw createHttpError(401, "Unauthorised");
        }
        next();
    }
    catch(error) {
        console.error(error);
    }
}

export default isTaskCreator;