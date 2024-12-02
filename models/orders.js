import mongoose, { Schema } from "mongoose";
const orderSchema = new Schema({
  status: {
    type: String,
    required: true,
    enum: ["In Progress", "Delivered", "Canceled"],
    default: "In Progress"
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  },
  deliveryMan: {
    type: Schema.Types.ObjectId,
    ref: "staff",
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
  deliveredOn: {
    type: Date
  },
  canceledOn: {
    type: Date
  },
  deliveryAddress: {
    type: Schema.Types.ObjectId,
    ref: "address",
    required: true
  }
});
const Order = mongoose.model("order", orderSchema);
export default Order;
