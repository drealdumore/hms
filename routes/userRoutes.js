import { Router } from "express";
import * as userController from "../controllers/userController.js";
import * as authController from "../controllers/authController.js";

const userRouter = Router();

userRouter.post("/signup", authController.signUp);

userRouter.post("/login", authController.signIn);

userRouter.get("/logout", authController.logOut);

userRouter.post("/forgotPassword", authController.forgotPassword);

userRouter.patch("/resetPassword/:token", authController.resetPassword);

// SEND email verification code
userRouter.post(
  "/sendEmailVerificationCode",
  authController.sendEmailVerification
);

// VERIFY email using a code
userRouter.post("/verifyEmailCode", authController.verifyEmailCode);

// Add refresh token route
userRouter.post("/refreshToken", authController.refreshAccessToken);

// Middleware to protect routes for authenticated users
// Only Logged In Users
userRouter.use(authController.protect);

// Middleware to restrict access to verified users
// userRouter.use(authController.protectVerified);

userRouter.get("/me", userController.getMe, userController.getUser);

userRouter.patch("/updateMyPassword", authController.updatePassword);

userRouter.patch("/updateMe", userController.updateMe);

userRouter.patch("/disableMe", userController.disableMe);

userRouter.delete("/deleteMe", userController.deleteMe);

// For User to book a room
userRouter.post("/bookRoom", userController.bookRoom);

export default userRouter;
