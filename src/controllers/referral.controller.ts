import { RequestHandler, Response, Request, NextFunction } from "express";
import createHttpError from "http-errors";
import userModel from "../models/user.model";
import referralModel from "../models/referral.model";


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

export const referralInviteHandler:RequestHandler = async (request:Request, response:Response, next:NextFunction) => {
    const { userId } = request;
    const { email } = request.body;
    try {
        if (!email) {
            throw createHttpError(400, "Parameters missing!");
        }
        const referral = await referralModel.create({
            email,
            earnerId: userId,
            sentAt: new Date(),
            status: "pending",
        });

        // add invite for specified email to queue
    
        response.status(200).json({
            success:true,
            message:"Referral invite sent!",
            data: {
                referral
            },
        })
    }
    catch(error) {
        next(error)
    }
}

export const getReferalsListHandler:RequestHandler = async (request:Request, response:Response, next:NextFunction) => {
    const { userId } = request;
    const { status, from, to } = request.query;
    const page = parseInt(request.query.page as string, 10) || 1;
    const limit = parseInt(request.query.limit as string, 10) || 10;
    try {
        // create object containing query parameters
        const query: any = { earnerId: userId };
        if (status) query.status = status;
        if (from || to) {
            query.sentAt = {};
            if (from) query.sentAt.$gte = new Date(from as string);
            if (to) query.sentAt.$lte = new Date(to as string);
        }

        // search for referrals
        const referrals = await referralModel.find(query)
        .skip((page - 1) * limit)
        .limit(limit)

        const totalCount = referrals.length;

        response.status(200).json({
            success:true,
            message:"Here are your list of referrals!",
            data: referrals,
            pagination: {
                page,
                limit,
                totalCount,
            },
        })
    }
    catch(error) {
        next(error)
    }
}