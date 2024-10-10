import express from "express";
import {  getAdminUserProfile, getUserProfile } from "../controllers/user.controller.js";
import catchAsyncError from "../middlewares/catchAsyncError.middleware.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.middleware.js";
import isAdmin from "../middlewares/isAdmin.middleware.js";

const userRoute = express.Router();

userRoute
  .get("/get-user-profile", isLoggedIn, catchAsyncError(getUserProfile))
  .get("/get-admin-profile", isLoggedIn, isAdmin,  catchAsyncError(getAdminUserProfile))
 
export default userRoute;

