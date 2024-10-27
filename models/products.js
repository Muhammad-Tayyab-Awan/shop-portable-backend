import mongoose from "mongoose";
const productSchema = new mongoose.Schema({
  pname: {
    type: String,
    unique: true,
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
  launchDate: {
    type: Date,
    default: Date.now
  }
});
const Product = mongoose.model("products", productSchema);
export default Product;
