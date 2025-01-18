import "dotenv/config";
import mongoose from "mongoose";
import morgan from "morgan";
import createHttpError, {isHttpError} from "http-errors";
import cors from "cors";
import env from "./utils/validateEnv";
import app from "./app";
import { connectDB } from "./db/connectDB";


app.listen(env.PORT, () => {
    connectDB()
    console.log(`Application is running at port ${env.PORT}`)
})
