import User from "../models/userModel.js";
import Room from "../models/roomModel.js";
import AppError from "../utilities/appError.js";
import catchAsync from "../utilities/catchAsync.js";
import { filterObj } from "../utilities/filterObj.js";

export const updateMe = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, passwordConfirm } = req.body;

  if (password || passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword",
        400
      )
    );
  }

  // console.log("email : ", email.trim());

  const trimmedEmail = email.trim();
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();

  // check for valid email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return next(new AppError("Invalid email format!", 401));
  }

  // check the firstName field to prevent input of unwanted characters
  if (!/^[a-zA-Z0-9 -]+$/.test(trimmedFirstName)) {
    return next(new AppError("Invalid first name!", 401));
  }

  // check the lastName field to prevent input of unwanted characters
  if (!/^[a-zA-Z0-9 -]+$/.test(trimmedLastName)) {
    return next(new AppError("Invalid last name!", 401));
  }

  // 2) Filtered out unwanted fields names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");

  const body = {
    firstName: trimmedFirstName,
    lastName: trimmedLastName,
    email: trimmedEmail,
  };

  const updatedUser = await User.findByIdAndUpdate(req.user.id, body, {
    // const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No user with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const disableMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: "success",
    message: "Account Disabled successfully!",
    data: null,
  });
});

export const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

export const bookRoom = catchAsync(async (req, res, next) => {
  const { roomId } = req.body;

  // Check if the room exists
  const room = await Room.findById(roomId).populate("hostel");

  if (!room) {
    return next(new AppError("Room not found", 404));
  }

  // Check if the room is available
  if (room.status === "occupied") {
    return next(new AppError("Room is already occupied", 400));
  }

  // Assign the user to the room
  room.tenants.push(req.user.id);
  room.status = "occupied";
  await room.save();

  res.status(200).json({
    status: "success",
    message: `Room ${room.number} in hostel ${room.hostel.name} booked successfully`,
    data: {
      room,
    },
  });
});
