import { model, Schema } from "mongoose";
import validator from "validator";
import crypto from "crypto";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "Please tell us your first name!"],
    },
    lastName: {
      type: String,
      required: [true, "Please tell us your last name!"],
    },
    email: {
      type: String,
      required: [true, "Please provide your email address"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Please provide a valid email address"],
    },
    password: {
      type: String,
      required: [true, "please provide a password!"],
      minlength: 8,
      maxLength: 20,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password!"],
      validate: {
        // ONLY RUNS ON CREATE AND SAVE
        validator: function (el) {
          return el === this.password;
        },
        message: "Password did not match!",
      },
    },
    role: {
      type: String,
      enum: ["user", "hall admin", "portal manager", "administrator"],
      default: "user",
    },
    profilePicture: {
      type: String,
      default:
        "https://res.cloudinary.com/dgxyjw6q8/image/upload/v1696332701/default_mwrcrs.png",
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
      type: Boolean,
      default: true,
      // select: false, // if false, wont show field res json
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationCode: String,
    emailVerificationExpires: Date,
    emailVerificationToken: String,
  },
  
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  // so if password was not modified, return next
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  // Update passwordChangedAt field if password was modified and document is not new
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  //? Removed this so i can find inactive users

  // Automatically exclude inactive users from all find queries
  // this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // Check if the password was changed after the JWT was issued
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means password was NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  // Create a random token
  const resetToken = crypto.randomBytes(32).toString("hex");

  // Hash the token and store it in the database
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  console.log(
    "coming from user model::::: ",
    { resetToken },
    this.passwordResetToken
  );

  // Set the token expiry time to 10 minutes
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // Return the plain reset token
  return resetToken;
};

userSchema.methods.updatePassword = async function (
  currentPassword,
  newPassword,
  newPasswordConfirm
) {
  // Check if the current password is correct
  const isCorrect = await this.correctPassword(currentPassword, this.password);
  if (!isCorrect) {
    throw new Error("Current password is incorrect!");
  }

  // Ensure the new password and confirmation match
  if (newPassword !== newPasswordConfirm) {
    throw new Error("New passwords do not match!");
  }

  // Hash the new password
  this.password = await bcrypt.hash(newPassword, 12);

  // Update the passwordChangedAt field
  this.passwordChangedAt = Date.now();

  // Clear any existing password reset tokens
  this.passwordResetToken = undefined;
  this.passwordResetExpires = undefined;

  // Save the updated user document
  await this.save();
};

userSchema.methods.createEmailVerificationCode = function () {
  // Generate a random 6-digit code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();

  this.emailVerificationCode = verificationCode;

  // Hash the code and store it in the database
  // this.emailVerificationCode = crypto
  //   .createHash("sha256")
  //   .update(verificationCode)
  //   .digest("hex");

  // Set code expiration time --- 10 minutes
  this.emailVerificationExpires = Date.now() + 10 * 60 * 1000;

  // Return the un-hashed code to send via email
  return verificationCode;
};

const User = model("User", userSchema);

export default User;
