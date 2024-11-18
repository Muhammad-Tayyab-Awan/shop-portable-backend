import mongoose, { Schema } from "mongoose";
const productSchema = new Schema(
  {
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
    sold: {
      type: Number,
      required: true,
      default: 0
    },
    productCreator: {
      type: Schema.Types.ObjectId,
      ref: "staff",
      required: true
    },
    launchDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);
const Product = mongoose.model("product", productSchema);
export default Product;
