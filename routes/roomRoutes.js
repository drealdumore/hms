import express from "express";
import {
  createRoom,
  getAllRooms,
  getRoomById,
  updateRoom,
  deleteRoom,
  addTenantToRoom,
  getRoomsByHostelId,
} from "../controllers/roomController.js";
import * as authController from "../controllers/authController.js";

const roomRouter = express.Router();

// Protect all routes after this middleware
roomRouter.use(authController.protect);
roomRouter.use(authController.restrictTo("administrator"));

// Route to create a new room
roomRouter.post("/createRoom", createRoom);

// Route to get all rooms
roomRouter.get("/getAllRooms", getAllRooms);

// Route to get a single room by ID
roomRouter.get("/getRoom/:id", getRoomById);

// Route to update a room by ID
roomRouter.patch("/updateRoom/:id", updateRoom);

// Route to delete a room by ID
roomRouter.delete("/deleteRoom/:id", deleteRoom);

// Route to add a tenant to a room
roomRouter.post("/add-tenant", addTenantToRoom);

// Get all rooms related to the hostel
roomRouter.get("/getRoomsByHostelId/:hostelId", getRoomsByHostelId);



export default roomRouter;
