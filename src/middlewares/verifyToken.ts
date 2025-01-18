import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt, {JwtPayload} from "jsonwebtoken";
import env from "../utils/validateEnv";

interface DecodedToken extends JwtPayload {
    userId:string
}

const verifyToken = (request:Request, response:Response, next:NextFunction) => {
    const token = request.cookies.altbucksToken;
    if(!token){
        throw createHttpError(409, "No token found!")
    }
    try{
        const decodedToken = jwt.verify(token, env.JWT_SECRET) as DecodedToken
        if(!decodedToken){
            throw createHttpError(409, "Something wrong with user token")
        }
        request.userId = decodedToken.userId
        next();
    }
    catch(error){
        console.error(error);
    }
}

export default verifyToken;