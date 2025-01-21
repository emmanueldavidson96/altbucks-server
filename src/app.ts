import "dotenv/config";
import express, {NextFunction, Request, Response} from "express";
import morgan from "morgan";
import createHttpError, {isHttpError} from "http-errors";
import cors from "cors";
import env from "./utils/validateEnv";
import userRoutes from "./routes/user.routes";
import cookieParser from "cookie-parser";
import walletRoute from "./routes/wallet.routes"
import cardRoute from "./routes/card.routes"
import taskRoute from "./routes/task.routes"



// Middlewares
const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
 
app.use(cors({
    origin:["http://localhost:3000","https://altbucks.vercel.app"],
    credentials:true
}));

//Routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/wallet", walletRoute)
app.use("/api/v1/card", cardRoute)
app.use("/api/v1/task", taskRoute)


//Error Handling
app.use((request, response, next) => {
    next(createHttpError(404,"Endpoint not found"))
})

//wallet


app.use((error:unknown, request:Request, response:Response, next:NextFunction) => {
    console.error(error);
    let errorMessage = "An unknown error occcured!"
    let statusCode = 500;
    if(isHttpError(error)){ 
        statusCode = error.status;
        errorMessage = error.message;
    }
    response.status(statusCode).json({
        error:errorMessage
    })
})

export default app;
