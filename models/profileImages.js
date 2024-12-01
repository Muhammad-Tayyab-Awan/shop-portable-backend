import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
const profileImageSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
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
const ProfileImage = mongoose.model("profileImage", profileImageSchema);
export default ProfileImage;
