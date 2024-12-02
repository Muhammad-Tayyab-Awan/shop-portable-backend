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
  totalPrice: {
    type: Number,
    required: true,
    default: 0
  }
});
const OrderItem = mongoose.model("orderItem", orderItemSchema);
export default OrderItem;
