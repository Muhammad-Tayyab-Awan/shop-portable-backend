import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
const profileImageSchema = new Schema({
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
    default: uuidv4
  },
  contentType: {
    type: String,
    required: true,
    default: "image/png",
    enum: ["image/png"]
  },
  addedOn: {
    type: Date,
    default: Date.now
  }
});
const ProductImage = mongoose.model("profileImage", imageSchema);
export default ProductImage;
