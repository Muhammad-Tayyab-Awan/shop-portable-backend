import mongoose, { Schema } from "mongoose";

const cartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "product",
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true,
    default: function () {
      return this.quantity * this.price;
    }
  }
});

const cartSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true
    },
    items: [cartItemSchema],
    totalQuantity: {
      type: Number,
      required: true,
      default: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0
    }
  },
  { timestamps: true }
);

cartSchema.pre("save", function (next) {
  this.totalQuantity = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalPrice = this.items.reduce((sum, item) => sum + item.total, 0);
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
