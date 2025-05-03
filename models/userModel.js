import { model, Schema } from "mongoose";
import validator from "validator";

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

const User = model("User", userSchema);

export default User;
