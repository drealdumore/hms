import { model, Schema } from "mongoose";
import slugify from "../utilities/slugify.js";

const hostelSchema = new Schema({
  name: {
    type: String,
    required: [true, "Hostel name is required"],
    trim: true,
    unique: true,
    minlength: [3, "Hostel name must be at least 3 characters long"],
  },
  slug: {
    type: String,
    unique: true,
  },
  address: {
    type: String,
    required: [true, "Address is required"],
    trim: true,
  },
  rooms: [
    {
      type: Schema.Types.ObjectId,
      ref: "Room",
    },
  ],
  // manager: {
  //   type: String,
  //   required: [true, "Manager name is required"],
  //   trim: true,
  // },

  createdAt: {
    type: Date,
    default: Date.now, // Automatically sets the creation date
  },
});

// Pre-save middleware to generate slug from name
hostelSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Pre-update middleware to update slug when name is updated
hostelSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(update.name, { lower: true, strict: true });
  }
  next();
});

// Export the Hostel model
const Hostel = model("Hostel", hostelSchema);
export default Hostel;
