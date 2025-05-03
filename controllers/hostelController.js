import Hostel from "../models/hostelModel.js";
import Room from "../models/roomModel.js";
import AppError from "../utilities/appError.js";
import catchAsync from "../utilities/catchAsync.js";

// Create a new hostel
export const createHostel = catchAsync(async (req, res) => {
  const { name, address } = req.body;

  if (!name || !address) {
    return next(
      new AppError("Name & Address are required to create a hostel!", 400)
    );
  }

  const hostel = await Hostel.create({ name, address });

  res.status(201).json({
    status: "success",
    message: "Hostel created successfully!!",
    data: { hostel },
  });
});

// Get all hostels
export const getAllHostels = catchAsync(async (req, res) => {
  const hostels = await Hostel.find().populate("rooms");

  res.status(200).json({
    status: "success",
    results: hostels.length,
    data: hostels,
  });
});

// Get a single hostel by ID
export const getHostelById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const hostel = await Hostel.findById(id).populate("rooms");

  if (!hostel) {
    return next(new AppError("Hostel not found!", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Hostel deleted successfully",
    data: { hostel },
  });
});

// Update a hostel
export const updateHostel = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Update the hostel
  const hostel = await Hostel.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!hostel) {
    return next(new AppError("Hostel not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: "Hostel updated successfully",
    data: { hostel },
  });
});

// Delete a hostel
export const deleteHostel = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Check if the hostel has associated rooms
  const rooms = await Room.find({ hostel: id });
  if (rooms.length > 0) {
    return next(
      new AppError("Cannot delete hostel with associated rooms", 400)
    );
  }

  // Delete the hostel
  const hostel = await Hostel.findByIdAndDelete(id);

  if (!hostel) {
    return next(new AppError("Hostel not found", 404));
  }

  res.status(204).json({
    status: "success",
    message: "Hostel deleted successfully",
    data: null,
  });
});
