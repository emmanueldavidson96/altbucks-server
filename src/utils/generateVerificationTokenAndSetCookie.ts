import jwt from "jsonwebtoken";
import env from "../utils/validateEnv";
import { Response } from "express";

const generateTokenAndSetCookie = (response:Response, userId:unknown) => {
    const token = jwt.sign({userId}, env.JWT_SECRET, {
        expiresIn:"7d"
    })

    response.cookie("altbucksToken", token, {
        httpOnly:true,
        secure:true,
        sameSite:"none",
        maxAge:7*24*60*60*1000
    })
    return token
}

export default generateTokenAndSetCookie;