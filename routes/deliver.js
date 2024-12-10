import express from "express";
const router = express.Router();
import verifyDMLogin from "../middlewares/verifyDMLogin.js";
import Order from "../models/orders.js";
import { param, validationResult } from "express-validator";
router.get("/", verifyDMLogin, async (req, res) => {
  try {
    const deliveryManId = req.staffId;
    const allOrders = await Order.find({ deliveryMan: deliveryManId })
      .populate("deliveryAddress", ["-__v"], "address")
      .populate("user", ["-__v", "-password"]);
    if (allOrders.length > 0) {
      res.status(200).json({ success: true, orders: allOrders });
    } else {
      res.status(400).json({ success: false, error: "No orders are found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
});
export default router;
