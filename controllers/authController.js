import crypto from "crypto";
import { promisify } from "util";
import jwt from "jsonwebtoken";
import AppError from "../utilities/appError.js";
import catchAsync from "../utilities/catchAsync.js";
import User from "../models/userModel.js";
import Token from "../models/tokenModel.js";
import Email from "../utilities/email.js";
import { validateEmailDomain } from "../utilities/validateEmailDomain.js";

// Helper function to sign tokens
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_SECRET_EXPIRES_IN,
  });
};

// Unified function to send both access and refresh tokens
const createAndSendTokens = async (user, statusCode, req, res) => {
  const accessToken = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Set cookies for tokens
  res.cookie("jwt", accessToken, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(
      Date.now() +
        process.env.JWT_REFRESH_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  });

  // Save refresh token in the database
  await Token.create({ token: refreshToken, user: user._id });

  // Remove password from output
  user.password = undefined;

  // Send response
  res.status(statusCode).json({
    status: "success",
    accessToken,
    refreshToken,
    data: {
      user,
    },
  });
};

//NOTE -
/**
 * Refresh Token Endpoint
 * -----------------------
 * This endpoint is used to issue a new access token when the current one expires.
 *
 * How it works:
 * 1. The client sends the refresh token (stored in an HTTP-only cookie) to this endpoint.
 * 2. The server verifies the refresh token to ensure it is valid and not expired.
 * 3. If valid, the server issues a new access token and rotates the refresh token.
 * 4. The new refresh token is sent back to the client and stored in the cookie.
 * 5. If the refresh token is invalid or expired, the client must log in again.
 *
 * When to call this endpoint:
 * - Call this endpoint when the access token expires and you need a new one.
 * - Typically, this is handled automatically by the client application (e.g., a frontend app).
 */

export const refreshAccessToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return next(
      new AppError("Refresh token not found. Please log in again.", 401)
    );
  }

  // Verify refresh token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );
  } catch (err) {
    return next(
      new AppError(
        "Invalid or expired refresh token. Please log in again.",
        401
      )
    );
  }

  // Check if the token exists in the database
  const storedToken = await Token.findOne({ token: refreshToken });
  if (!storedToken) {
    return next(
      new AppError("Refresh token is invalid or has been revoked.", 401)
    );
  }

  // Check if user exists
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(new AppError("User no longer exists.", 401));
  }

  // Issue new access token
  const newAccessToken = signToken(user._id);

  // Rotate refresh token
  const newRefreshToken = signRefreshToken(user._id);
  storedToken.token = newRefreshToken;
  await storedToken.save();

  // Send new tokens
  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(
      Date.now() +
        process.env.JWT_REFRESH_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
  });

  res.status(200).json({
    status: "success",
    accessToken: newAccessToken,
  });
});

//NOTE -
/**
 * WHICH METHOD MAKES MORE SENSE --- MY CURRENT ONE OR THE NEW???
 * -----------------------
 JUST discovered a new method to verify users --- in this method, i'll have model for all TOKENS(thats all jwt's), 
 so when a user is created successfully, i create a new token that will be saved in the TOKEN db --- with the 
 userId and the token. and then i send the token with a link to user's mail to be verified:::`/users/${user._id}/confirm/${token.token}`. 
 and then to verify it, i'll use the link and then check the TOKEN db if the userId and token thats in the link matches 
 with any token in the db. if it matches, then i update emailVerified to TRUE. and then login. 
 */

export const sendEmailVerification = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // 1) Find the user by email
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("No user found with this email address!", 404));
  }

  // 2) Generate a random 6-digit code
  const verificationCode = user.createEmailVerificationCode();
  await user.save({ validateBeforeSave: false });

  try {
    // 3) Send the verification code via email

    const payload = verificationCode;

    const sendEmail = new Email(user, payload);

    await sendEmail.sendEmailVerificationCode();

    res.status(200).json({
      status: "success",
      code: verificationCode,
      message: "Verification code sent to email successfully!",
    });
  } catch (error) {
    return next(new AppError("Failed to send verification email!", 500));
  }
});

export const verifyEmailCode = catchAsync(async (req, res, next) => {
  const { email, code } = req.body;

  // 1) Find the user by email
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("No user found with this email address!", 404));
  }

  // 2) Hash the provided code and compare it with the stored hashed code
  // const hashedCode = crypto.createHash("sha256").update(code).digest("hex");

  // if (
  //   hashedCode !== user.emailVerificationCode ||
  //   user.emailVerificationExpires < Date.now()
  // ) {
  //   return next(new AppError("Invalid or expired verification code!", 400));
  // }

  if (
    code !== user.emailVerificationCode ||
    user.emailVerificationExpires < Date.now()
  ) {
    return next(new AppError("Invalid or expired verification code!", 400));
  }

  // 3) Mark the email as verified
  user.emailVerified = true;
  user.emailVerificationCode = undefined;
  user.emailVerificationExpires = undefined;

  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    message: "Email verified successfully!",
  });
});

export const signUp = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, passwordConfirm } = req.body;

  if (!firstName || !lastName || !email || !password || !passwordConfirm) {
    return next(new AppError("All fields are required!", 400));
  }

  const trimmedEmail = email.trim();
  const trimmedFirstName = firstName.trim();
  const trimmedLastName = lastName.trim();

  // Validate email domain
  validateEmailDomain(trimmedEmail, next);

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return next(new AppError("Invalid email format!", 401));
  }

  // Validate first and last name
  if (!/^[a-zA-Z0-9 -]+$/.test(trimmedFirstName)) {
    return next(new AppError("Invalid first name!", 401));
  }
  if (!/^[a-zA-Z0-9 -]+$/.test(trimmedLastName)) {
    return next(new AppError("Invalid last name!", 401));
  }

  // Validate password strength
  if (
    !/^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/.test(
      password
    )
  ) {
    return next(
      new AppError(
        "Password must contain at least 1 special character, 1 lowercase letter, and 1 uppercase letter. It must be 8-20 characters long.",
        401
      )
    );
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return next(
      new AppError("User with this email address already exists!", 401)
    );
  }

  // Create new user
  const newUser = await User.create({
    firstName: trimmedFirstName,
    lastName: trimmedLastName,
    email: trimmedEmail,
    password,
    passwordConfirm,
  });

  try {
    const payload = `${req.protocol}://${req.get("host")}/me`;
    const sendEmail = new Email(newUser, payload);

    await sendEmail.sendWelcomeEmail();

    // Send tokens
    await createAndSendTokens(newUser, 201, req, res);
  } catch (error) {
    return next(new AppError("Failed to send verification email!", 500));
  }
});

export const signIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 422));
  }

  const trimmedEmail = email.trim();

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return next(new AppError("Invalid email format!", 401));
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // Send tokens
  await createAndSendTokens(user, 200, req, res);
});

export const adminSignIn = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Validate email and password input
  if (!email || !password) {
    return next(new AppError("Please provide email and password!", 400));
  }

  // 2) Find user and validate credentials
  const admin = await User.findOne({ email }).select("+password");

  if (!admin || !(await admin.correctPassword(password, admin.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // 3) Ensure the user is not a regular user
  if (admin.role === "user") {
    return next(new AppError("Access denied! Only admins are allowed.", 403));
  }

  // 4) Send token to client
  await createAndSendTokens(admin, 200, req, res);
});

export const createAdmin = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, passwordConfirm, role } =
    req.body;

  const trimmedEmail = email.trim();

  // Validate email domain
  validateEmailDomain(trimmedEmail, next);

  // Create new admin
  const newAdmin = await User.create({
    firstName,
    lastName,
    email: trimmedEmail,
    password,
    passwordConfirm,
    role: !role ? "administrator" : role,
  });

  await createAndSendTokens(newAdmin, 201, req, res);
});

export const logOut = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (refreshToken) {
    await Token.findOneAndDelete({ token: refreshToken });
  }

  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.clearCookie("refreshToken");

  res.status(200).json({
    status: "success",
    message: "User logged out successfully!",
  });
});

export const protect = catchAsync(async (req, res, next) => {
  // getting token

  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  // Add refresh token logic
  if (!token && req.cookies.refreshToken) {
    const refreshToken = req.cookies.refreshToken;

    try {
      const decodedRefresh = await promisify(jwt.verify)(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );

      const user = await User.findById(decodedRefresh.id);
      if (!user) {
        return next(
          new AppError(
            "The user belonging to this refresh token no longer exists.",
            401
          )
        );
      }

      // Issue new access token
      token = signToken(user._id);

      // Rotate refresh token
      const newRefreshToken = signRefreshToken(user._id);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        expires: new Date(
          Date.now() +
            process.env.JWT_REFRESH_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        ),
      });
    } catch (err) {
      return next(
        new AppError(
          "Invalid or expired refresh token. Please log in again.",
          401
        )
      );
    }
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to gain access.", 401)
    );
  }

  //   Verify Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check is user EXISTS
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists..")
    );
  }

  // Check is user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please log in again.")
    );
  }

  // IF everything is okay, Grant access to protected route
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have access to perform this action!!", 403)
      );
    }

    next();
  };
};

export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // Get User from EMAIL
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("No user with that email address!", 404));
  }

  // GENERATE random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const payload = `${req.protocol}://${req.get(
      "host"
    )}/api/users/resetPassword/${resetToken}`;

    const sendEmail = new Email(user, payload);

    await sendEmail.sendForgotPassword();

    // GET the Password reset token
    res.status(200).json({
      status: "success",
      message: "Token sent!, Check your email to change your password...",
      resetToken, // TODO --- Remove later
      resetURL: payload,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

// so after password is reset, user gets logged in automatically
export const resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;

  // GET user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If !token && !user ...Send ERROR
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  // If token hasn't expired and user exist...set new password
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // 3) Update changedPasswordAt property for the user
  user.changedPasswordAt = Date.now();
  await user.save();

  // 4) Log the user in, send JWT
  await createAndSendTokens(user, 200, req, res);
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;

  // 1) Get the user from the collection
  const user = await User.findById(req.user.id).select("+password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // 2) Check if the current password is correct
  const isCorrect = await user.correctPassword(currentPassword, user.password);

  if (!isCorrect) {
    return next(new AppError("Your current password is incorrect", 401));
  }

  // 3) Check if the new password is the same as the current password
  const isSameAsCurrent = await user.correctPassword(
    newPassword,
    user.password
  );

  if (isSameAsCurrent) {
    return next(
      new AppError(
        "New password cannot be the same as the current password",
        400
      )
    );
  }

  // 4) Update the password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;
  await user.save();

  // 5) Send success response
  res.status(200).json({
    status: "success",
    message: "Password updated successfully!",
  });

  // Optionally, log the user in by sending new tokens
  await createAndSendTokens(user, 200, req, res);
});

export const protectVerified = catchAsync(async (req, res, next) => {
  if (!req.user.emailVerified) {
    return next(
      new AppError("Please verify your email to access this route.", 403)
    );
  }
  next();
});
