import { model, Schema } from "mongoose";

const roomSchema = new Schema({
  number: {
    type: String,
    unique: true,
    required: true,
  },

  status: {
    type: String,
    enum: ["available", "occupied"],
    default: "available",
  },
  capacity: {
    type: Number,
    required: [true, "Capacity is required"],
    enum: [4, 6],
    default: 4,
    min: [4, "Capacity must be at least 4"],
  },
  tenants: [
    {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model
    },
  ],
  hostel: {
    type: Schema.Types.ObjectId,
    ref: "Hostel", // Reference to the Hostel model
    required: true, // Ensure every room is associated with a hostel
  },
});

// Export the Room model
const Room = model("Room", roomSchema);
export default Room;
