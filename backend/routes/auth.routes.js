import express from "express";
import {
  login,
  logout,
  refresh,
  register,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleOathRequest,
  googleOAuth,
  onOauthSuccess,
} from "../controllers/auth.controller.js";
import catchAsyncError from "../middlewares/catchAsyncError.middleware.js";

const authRoute = express.Router();

authRoute
  .post("/register", catchAsyncError(register))
  .post("/verify-email", catchAsyncError(verifyEmail))
  .post("/login", catchAsyncError(login))
  .post("/logout", catchAsyncError(logout))
  .post("/refresh", catchAsyncError(refresh))
  .post("/forgot-password", catchAsyncError(forgotPassword))
  .post("/reset-password/:token", catchAsyncError(resetPassword))
  .post("/google-request", catchAsyncError(googleOathRequest))
  .get("/oauth", catchAsyncError(googleOAuth))
  .post("/google-auth-successful", catchAsyncError(onOauthSuccess))
  

export default authRoute;

