import User from "../models/userModel.js";
import catchAsync from "../utilities/catchAsync.js";
import AppError from "../utilities/appError.js";

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ active: true }).lean();

  if (!users || users.length === 0) {
    return next(new AppError("No users found.", 404));
  }

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

export const getInactiveUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ active: false }).lean();

  if (!users || users.length === 0) {
    return next(new AppError("No inactive users found.", 404));
  }

  res.status(200).json({
    status: "success",
    results: users.length,
    data: { users },
  });
});

export const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).lean();

  if (!user) {
    return next(new AppError("No user found with the provided ID.", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const updateUser = catchAsync(async (req, res, next) => {
  const { emailVerified, active, role, ...otherFields } = req.body;

  // Validate input fields
  if (Object.keys(req.body).length === 0) {
    return next(
      new AppError(
        "At least one field (emailVerified, active, role) must be provided to update a user.",
        400
      )
    );
  }

  if (role && !["user", "administrator"].includes(role)) {
    return next(
      new AppError("Role must be either 'user' or 'administrator'.", 400)
    );
  }

  // Check for disallowed fields
  const disallowedFields = Object.keys(otherFields);
  if (disallowedFields.length > 0) {
    const errorMessage =
      disallowedFields.length === 1
        ? `Admin cannot update ${disallowedFields[0]}.`
        : `Admin cannot update the following fields: ${disallowedFields.join(
            ", "
          )}.`;
    return next(new AppError(errorMessage, 403));
  }

  // Update user
  const updates = { emailVerified, active, role };
  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("No user found with the provided ID.", 404));
  }

  res.status(200).json({
    status: "success",
    data: { user },
  });
});

export const disableUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { active: false },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new AppError("No user found with the provided ID.", 404));
  }

  res.status(200).json({
    status: "success",
    message: "User disabled successfully.",
    data: { user },
  });
});

export const enableUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { active: true },
    {
      new: true,
    }
  );

  if (!user) {
    return next(new AppError("No user found with the provided ID.", 404));
  }

  res.status(200).json({
    status: "success",
    message: "User enabled successfully.",
    data: { user },
  });
});

export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("No user found with the provided ID.", 404));
  }

  res.status(204).json({
    status: "success",
    message: "User deleted successfully.",
  });
});

export const deleteAllUsers = catchAsync(async (req, res, next) => {
  const result = await User.deleteMany();

  res.status(200).json({
    status: "success",
    message: `${result.deletedCount} users deleted successfully.`,
  });
});
