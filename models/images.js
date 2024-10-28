import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
const imageSchema = new Schema({
  image1: {
    type: Buffer,
    unique: true,
    required: true
  },
  image2: {
    type: Buffer,
    unique: true,
    required: true
  },
  image3: {
    type: Buffer,
    unique: true,
    required: true
  },
  image4: {
    type: Buffer,
    unique: true
  },
  image5: {
    type: Buffer,
    unique: true
  },
  alt1: {
    type: String,
    required: true,
    default: `product_image_${uuidv4()}`
  },
  alt2: {
    type: String,
    required: true,
    default: `product_image_${uuidv4()}`
  },
  alt3: {
    type: String,
    required: true,
    default: `product_image_${uuidv4()}`
  },
  alt4: {
    type: String
  },
  alt5: {
    type: String
  },
  contentType: {
    type: String,
    required: true,
    default: "image/png",
    enum: ["image/png"]
  },
  imageCounts: {
    type: Number,
    required: true,
    default: 3
  }
});
const ProductImage = mongoose.model("productimage", imageSchema);
export default ProductImage;
