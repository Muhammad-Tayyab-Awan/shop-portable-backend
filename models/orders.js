import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";
const orderSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true
  },
  count: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ["In Progress", "Delivered", "Canceled"]
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  deliveryMan: {
    type: Schema.Types.ObjectId,
    ref: "staff",
    required: true,
    default: undefined
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  orderedOn: {
    type: Date,
    required: true,
    default: Date.now
  },
  canceledOn: {
    type: Date
  },
  deliveredOn: {
    type: Date
  },
  deliveryAddress: {
    type: Schema.Types.ObjectId,
    ref: "address",
    required: true
  }
});
const Order = mongoose.model("order", imageSchema);
export default Order;
