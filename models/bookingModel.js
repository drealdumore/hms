import { model, Schema } from "mongoose";

// THIS WILL INVOLVE THE BOOKING PROCESSES.
// contains the userID, roomId, price

const bookingSchema = new Schema(
  {
    rooms: [
      {
        type: Schema.Types.ObjectId,
        ref: "Room",
      },
    ],

    roomId: {
      type: String,
      required: true,
    },

    userId: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["active", "cancelled", "completed"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Export the Bookings model
const Bookings = model("Bookings", bookingSchema);
export default Bookings;
