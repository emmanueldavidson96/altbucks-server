import { NextFunction, Request, Response } from "express";
import taskModel from "../models/task.model";
import fs from "fs"
import cloudinary from "../utils/cloudinary"
import createHttpError from "http-errors";

export const CreateTask = async (request:Request, response:Response, next:NextFunction) => {
    const {
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
    } = request.body
    let result;

    try{
        const userId = request.userId;
        if(!userId){
            throw createHttpError(409, "Not authenticated")
        }
        // if (!request.file) {
        //     throw createHttpError(409, "No file uploaded")
        // }
        if(request.file){
            const path = request.file?.path
            result = await cloudinary.uploader.upload(path);
        }
        
        
        //Upload image to cloudinary
        const newTask = new taskModel({
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
            taskImage: request.file ? result?.secure_url : "",
            cloudinary_id: request.file ? result?.public_id : "",
            authorId:userId
        })
        await newTask.save();
        response.status(201).json({
            success:true,
            message:"Task Successfully created and saved",
            newTask
        })
    }
    catch(err){
        next(err)
    }
}


export const getAllTasks = async (request:Request, response:Response, next:NextFunction) => {
    try{
        let {page, limit, search} = request.query;
        const pageNumber = parseInt(page as string) || 1;
        const limitNumber = parseInt(limit as string) || 12;
        const skip = (pageNumber - 1) * limitNumber;
        let searchCriteria = {}
        if(search){
            searchCriteria = {
                articleTitle: {
                    $regex: search,
                    $options:"i"
                }
            }
        }

        const totalTasks= await taskModel.countDocuments(searchCriteria);
        const allTasks = await taskModel.find(searchCriteria)
        .skip(skip)
        .limit(limitNumber)
        .sort({updateAt:-1})
        const totalPages = Math.ceil(totalTasks/limitNumber);
        response.status(200).json({
            success: true,
            message: "All tasks retrieved",
            allTasks:{
                tasks:allTasks,
                pagination:{
                    totalTasks,
                    currentPage:pageNumber,
                    totalPages,
                    pageSize:limitNumber
                }
            }
        })
    }
    catch(error){
        next(error)
    }
}


export const deleteTask = async (request:Request, response:Response, next:NextFunction) => {
    try{
        const userId = request.userId;
        if(!userId){
            response.status(403).json({
                success: false,
                message: "You are not authorized!"
            })
        }
        const task = await taskModel.findById(request.params.id);
        if (!task) {
            response.status(404).json({
                success: false,
                message: "Task not found!",
            });
        }
        await taskModel.findByIdAndDelete(request.params.id);    
        response.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });   
    } catch(error){
        next(error)
    }
}

export const taskInfo = async (request:Request, response:Response, next:NextFunction) => {

    try{
        const task = await taskModel.findById(request.params.id);
        response.status(200).json({
            success: true,
            message:"Article Found!",
            task
        })
    }
    catch(error){
        next(error);
    }
}


export const userTasks = async (request:Request, response:Response, next:NextFunction) => {
    const userId = request.userId;
    
    if(!userId){
        throw createHttpError(409,"No user found")
    }   
    try{
        const userTasks = await taskModel.find({authorId:userId})
        response.status(200).json({
            success: true,
            message: "User Tasks served",
            userTasks
        })
    }
    catch(error){
        next(error)
    }
}


export const editTask = async (request:Request, response:Response, next:NextFunction) => {
    const task = await taskModel.findById(request.params.id);
    //Delete the article image from cloudinary
    // await cloudinary.uploader.destroy(article.cloudinary_id);
    try{
        let result;
        if(request.file){
            result = await cloudinary.uploader.upload(request.file.path)
        }
        const data = {
            taskTitle: request.body.taskTitle || task?.taskTitle,
            taskType: request.body.taskType || task?.taskType,
            taskNumberofRespondent: request.body.taskNumberofRespondent || task?.taskNumberofRespondent,
            taskDescription: request.body.taskDescription || task?.taskDescription,
            taskLocation: request.body.taskDescription || task?.taskDescription,
            taskCompensation: request.body.taskCompensation || task?.taskCompensation,
            taskDeadline: request.body.taskDeadline || task?.taskDeadline,
            taskRequirements: request.body.taskRequirements || task?.taskRequirements,
            taskLinkUpload:request.body.taskLinkUpload || task?.taskLinkUpload,
            taskLinkUploadTwo: request.body.taskLinkUploadTwo || task?.taskLinkUploadTwo,
            taskImage:result?.secure_url,
            cloudinary_id: result?.public_id,
        }
        const editedTask = await taskModel.findByIdAndUpdate(request.params.id, data, {new:true});
        if(request.file){
            fs.unlinkSync(request.file.path)
        }
        response.status(200).json({
            success:true,
            message:"Successfully edited the article",
            editedTask
        })
    }
    catch(error){
        next(error)
    }
}