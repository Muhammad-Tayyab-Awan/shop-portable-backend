import OrderItem from "../models/orderItems.js";
import { validationResult } from "express-validator";
const getAllOrderItems = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const orderId = req.params.orderId;
      const orderItems = await OrderItem.find({ orderId: orderId }).populate(
        "productId",
        [
          "_id",
          "pname",
          "description",
          "price",
          "category",
          "status",
          "stock",
          "discount",
          "brand"
        ],
        "product"
      );
      res.status(200).json({
        success: true,
        orderItems: orderItems
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.errors
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
};
const orderItemController = { getAllOrderItems: getAllOrderItems };
export default orderItemController;
