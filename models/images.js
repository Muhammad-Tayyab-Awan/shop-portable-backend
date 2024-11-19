import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
const imageSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "product",
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
    default: `product_image_${uuidv4()}`
  },
  contentType: {
    type: String,
    required: true,
    default: "image/png",
    enum: ["image/png"]
  }
});
const ProductImage = mongoose.model("productimage", imageSchema);
export default ProductImage;
