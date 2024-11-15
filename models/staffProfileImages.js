import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
const staffProfileImageSchema = new Schema(
  {
    staffMember: {
      type: Schema.Types.ObjectId,
      ref: "staff",
      unique: true,
      required: true
    },
    image: {
      type: Buffer,
      unique: true,
      required: true
    },
    alt: {
      type: String,
      required: true,
      unique: true,
      default: `profile_image_${uuidv4()}`
    },
    contentType: {
      type: String,
      required: true,
      default: "image/png",
      enum: ["image/png"]
    }
  },
  { timestamps: true }
);
const StaffProfileImage = mongoose.model(
  "staffProfileImage",
  staffProfileImageSchema
);
export default StaffProfileImage;
