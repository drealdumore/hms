import { Router } from "express";
import * as adminController from "../controllers/adminController.js";
import * as authController from "../controllers/authController.js";
import * as hostelController from "../controllers/hostelController.js";
import * as roomController from "../controllers/roomController.js";

const adminRouter = Router();

// Admin Authentication
adminRouter.post("/login", authController.adminSignIn);
adminRouter.post("/verifyOtp", authController.verifyAdminOtp);

// Protect all routes after this middleware
adminRouter.use(authController.protect);
adminRouter.use(authController.restrictTo("administrator"));

// User Management
adminRouter.get("/getAllUsers", adminController.getAllUsers); // Add pagination in the controller
adminRouter.get("/getInactiveUsers", adminController.getInactiveUsers);
adminRouter.get("/getUser/:id", adminController.getUser);
adminRouter.patch("/updateUser/:id", adminController.updateUser);
adminRouter.patch("/disableUser/:id", adminController.disableUser);
adminRouter.patch("/enableUser/:id", adminController.enableUser);
adminRouter.delete("/deleteUser/:id", adminController.deleteUser);

// Admin Authentication
adminRouter.post("/createAdmin", authController.createAdmin);
adminRouter.post("/refreshToken", authController.refreshAccessToken);
adminRouter.delete("/deleteAllUsers", adminController.deleteAllUsers);

// Hostel Management
adminRouter.post("/createHostel", hostelController.createHostel);
adminRouter.patch("/updateHostel/:id", hostelController.updateHostel);
adminRouter.delete("/deleteHostel/:id", hostelController.deleteHostel);

// Room Management
adminRouter.post("/createRoom", roomController.createRoom);
adminRouter.post("/createMultipleRooms", roomController.createMultipleRooms);
adminRouter.get("/getAllRooms", roomController.getAllRooms);
adminRouter.patch("/updateRoom/:id", roomController.updateRoom);
adminRouter.delete("/deleteRoom/:id", roomController.deleteRoom);
adminRouter.get("/getAllHostels", hostelController.getAllHostels);

adminRouter.get("/getRoomStatus/:id", roomController.getRoomStatus);
adminRouter.get("/getOccupants/:id", roomController.getOccupants);

export default adminRouter;
