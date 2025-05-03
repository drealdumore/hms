import { Router } from "express";

import {
  createHostel,
  getAllHostels,
  getHostelById,
  updateHostel,
  deleteHostel,
} from "../controllers/hostelController.js";

import * as authController from "../controllers/authController.js";

const hostelRouter = Router();

// Protect all routes after this middleware
hostelRouter.use(authController.protect);
hostelRouter.use(authController.restrictTo("administrator"));

// Route to create a new hostel
hostelRouter.post("/createHostel", createHostel);

// Route to get all hostels
hostelRouter.get("/getAllHostel", getAllHostels);

// Route to get a single hostel by ID
hostelRouter.get("/getHostel/:id", getHostelById);

// Route to update a hostel by ID
hostelRouter.patch("/updateHostel/:id", updateHostel);

// Route to delete a hostel by ID
hostelRouter.delete("/deleteHostel/:id", deleteHostel);

export default hostelRouter;
