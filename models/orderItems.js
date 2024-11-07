import mongoose, { Schema } from "mongoose";
const orderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true
  },
  orderId: {
    type: Schema.Types.ObjectId,
    ref: "order",
    required: true
  },
  itemCount: {
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
  userId: {
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
const OrderItem = mongoose.model("orderItem", orderItemSchema);
export default OrderItem;
