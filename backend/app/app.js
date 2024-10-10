import express from "express";
import cors from "cors";
import dbConnect from "../config/dbConnect.config.js";
import cookieParser from "cookie-parser";
import notFoundErrHandler from "../middlewares/notFoundErrorHandler.middleware.js";
import globalErrHandler from "../middlewares/globalErrorHandler.middleware.js";
import authRoute from "../routes/auth.routes.js";
import userRoute from "../routes/user.routes.js";

//db Connect
dbConnect();
const app = express();

//cors
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
  })
);

//pass incoming data
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads/"));


//routes
const API_VERSION = process.env.API_VERSION

app.use(`${API_VERSION}/auth`, authRoute);
app.use(`${API_VERSION}/users`, userRoute);

//err middleware
app.use(notFoundErrHandler);
app.use(globalErrHandler);

export default app;
