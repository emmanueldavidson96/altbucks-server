import { RequestHandler, Response, Request, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "../models/user.model";


export const referralLinkHandler:RequestHandler = async (request:Request, response:Response, next:NextFunction) => {
    const { userId } = request;
    try {
        //Search for user in db
        const user = await userModel.findOne({
            _id:userId
        }).exec();

        // Fetch frontend url from env
        const frontendUrl = process.env.FRONTEND_URL

        // Create referral link
        const referralLink = `${frontendUrl}/sign-up-task-earner?referralCode=${user?.referralCode}`
        
        response.status(200).json({
            success:true,
            message:"Here's your Referral Link!",
            data: { referralLink },
        })
    }
    catch(error) {
        next(error)
    }
}