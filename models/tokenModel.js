import { Schema, model} from "mongoose";

const tokenSchema = new Schema({
  token: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: process.env.JWT_REFRESH_SECRET_EXPIRES_IN || 30 * 24 * 60 * 60, // Default to 30 days
  },
});

const Token = model("Token", tokenSchema);

export default Token;