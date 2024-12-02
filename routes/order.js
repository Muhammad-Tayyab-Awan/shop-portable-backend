import express from "express";
const router = express.Router();
import Order from "../models/orders.js";
import verifyUserLogin from "../middlewares/verifyUserLogin.js";
import verifyAdminLogin from "../middlewares/verifyAdminLogin.js";
router.route("/").get(verifyUserLogin, async (req, res) => {
  try {
    const userId = req.userId;
    const allOrders = await Order.find({ user: userId });
    if (allOrders.length > 0) {
      res.status(200).json({ success: true, allOrders: allOrders });
    } else {
      res
        .status(400)
        .json({ success: false, error: "No orders found for current user" });
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
