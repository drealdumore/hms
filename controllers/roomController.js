import Room from "../models/roomModel.js";
import Hostel from "../models/hostelModel.js";
import AppError from "../utilities/appError.js";
import catchAsync from "../utilities/catchAsync.js";

// Create multiple rooms
export const createMultipleRooms = catchAsync(async (req, res, next) => {
  const { rooms, hostel } = req.body;

  // Check if the hostel exists
  const existingHostel = await Hostel.findById(hostel);
  if (!existingHostel) {
    return next(new AppError("Hostel not found", 404));
  }

  // Validate rooms array
  if (!Array.isArray(rooms) || rooms.length === 0) {
    return next(
      new AppError("Please provide an array of rooms to create", 400)
    );
  }

  // Add the hostel ID to each room and create them
  const createdRooms = await Room.insertMany(
    rooms.map((room) => ({ ...room, hostel }))
  );

  res.status(201).json({
    status: "success",
    message: "Rooms created successfully",
    data: { rooms: createdRooms },
  });
});

// Create a new room
export const createRoom = catchAsync(async (req, res, next) => {
  const { number, capacity, hostel } = req.body;

  if (!number || !capacity || !hostel) {
    return next(
      new AppError(
        "All fields (number, capacity, hostel) are required to create a room",
        400
      )
    );
  }

  // Check if the hostel exists
  const existingHostel = await Hostel.findById(hostel);

  console.log(existingHostel);

  if (!existingHostel) {
    return next(new AppError("Hostel not found", 404));
  }

  // Create the room
  const room = await Room.create({ number, capacity, hostel });
  res.status(201).json({
    status: "success",
    message: "Room created successfully",
    data: { room },
  });
});

// Get all rooms
export const getAllRooms = catchAsync(async (req, res, next) => {
  const rooms = await Room.find().populate({
    path: "hostel",
    select: "slug", // Only include the slug field from the hostel
  });

  if (!rooms || rooms.length === 0) {
    return next(new AppError("No Rooms Found, Try creating..", 404));
  }

  // Transform the response to replace the hostel object with just the slug
  const transformedRooms = rooms.map((room) => ({
    ...room.toObject(),
    hostel: room.hostel.slug, // Replace the hostel object with the slug
  }));

  res.status(200).json({
    status: "success",
    results: transformedRooms.length,
    data: { rooms: transformedRooms },
  });
});

// Get a single room by ID
export const getRoomById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const room = await Room.findById(id);
  // const room = await Room.findById(id).populate("hostel").populate("tenants");
  if (!room) {
    return next(new AppError("Room not found", 404));
  }
  res.status(200).json(room);
});

// Update a room
export const updateRoom = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  // Update the room
  const room = await Room.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });
  if (!room) {
    return next(new AppError("Room not found", 404));
  }
  res.status(200).json({ message: "Room updated successfully", room });
});

// Delete a room
export const deleteRoom = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Delete the room
  const room = await Room.findByIdAndDelete(id);
  if (!room) {
    return next(new AppError("Room not found", 404));
  }
  res.status(200).json({ message: "Room deleted successfully" });
});

// Add a tenant to a room
export const addTenantToRoom = catchAsync(async (req, res, next) => {
  const { roomId } = req.body;

  // Find the room and populate the associated hostel
  const room = await Room.findById(roomId).populate("hostel tenants");
  if (!room) {
    return next(new AppError("Room not found", 404));
  }

  // Check if the room is already occupied
  if (room.status === "occupied") {
    return next(new AppError("Room is already occupied", 400));
  }

  // Check if the number of tenants has reached the hostel's capacity
  const maxCapacity = room.hostel.capacity;
  if (room.tenants.length >= maxCapacity) {
    return next(new AppError("Room has reached its maximum capacity", 400));
  }

  // Add the current user as a tenant
  room.tenants.push(req.user.id);

  // Update the room's status if it reaches maximum capacity
  if (room.tenants.length === maxCapacity) {
    room.status = "occupied";
  }

  // Save the updated room
  await room.save();

  res.status(200).json({
    status: "success",
    message: `You have been added to room ${room.number} in hostel ${room.hostel.name}`,
    data: {
      room,
    },
  });
});

// Get all rooms by hostel ID
export const getRoomsByHostelId = catchAsync(async (req, res, next) => {
  const hostelId = req.params.hostelId;
  console.log("hostelId: ", hostelId);

  // Check if the hostel exists
  const hostel = await Hostel.findById(hostelId);

  if (!hostel) {
    return next(new AppError("Hostel not found", 404));
  }

  // Find all rooms associated with the hostel
  const rooms = await Room.find({ hostel: hostelId }).populate("tenants");

  res.status(200).json({
    status: "success",
    results: rooms.length,
    data: {
      rooms,
    },
  });
});


// Check room status
export const getRoomStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find the room by ID
  const room = await Room.findById(id);

  if (!room) {
    return next(new AppError("Room not found", 404));
  }

  // Return the room status
  res.status(200).json({
    status: "success",
    data: {
      roomId: room._id,
      status: room.status, // e.g., "available", "occupied"
    },
  });
});

// Get only occupants of a room
export const getOccupants = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find the room by ID and populate tenants
  const room = await Room.findById(id).populate({
    path: "tenants",
    select: "name email", // Include only necessary fields from tenants
  });

  if (!room) {
    return next(new AppError("Room not found", 404));
  }

  // Return the occupants of the room
  res.status(200).json({
    status: "success",
    data: {
      roomId: room._id,
      occupants: room.tenants, // List of tenants
    },
  });
});
