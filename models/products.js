import mongoose, { Schema } from "mongoose";
const productSchema = new Schema({
  pname: {
    type: String,
    unique: true,
    required: true
  },
  imageId: {
    type: Schema.Types.ObjectId,
    ref: "productimage",
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ["Laptop", "Accessory"],
    required: true
  },
  status: {
    type: String,
    enum: ["Used", "New"],
    default: "New"
  },
  stock: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0.0
  },
  brand: {
    type: String,
    required: true
  },
  sold: {
    type: Number,
    required: true
  },
  launchDate: {
    type: Date,
    default: Date.now
  }
});
const Product = mongoose.model("product", productSchema);
export default Product;
