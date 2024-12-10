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

router.get("/canceled-orders", verifyDMLogin, async (req, res) => {
  try {
    const deliveryManId = req.staffId;
    const canceledOrders = await Order.find({
      status: "Canceled",
      deliveryMan: deliveryManId
    })
      .populate("deliveryAddress", ["-__v"], "address")
      .populate("user", ["-__v", "-password"]);
    if (canceledOrders.length > 0) {
      res.status(200).json({ success: true, canceledOrders });
    } else {
      res
        .status(400)
        .json({ success: false, error: "No canceled orders found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
});

router.get("/completed-orders", verifyDMLogin, async (req, res) => {
  try {
    const deliveryManId = req.staffId;
    const deliveredOrders = await Order.find({
      status: "Delivered",
      deliveryMan: deliveryManId
    })
      .populate("deliveryAddress", ["-__v"], "address")
      .populate("user", ["-__v", "-password"]);
    if (deliveredOrders.length > 0) {
      res.status(200).json({ success: true, deliveredOrders: deliveredOrders });
    } else {
      res
        .status(400)
        .json({ success: false, error: "No delivered orders found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
});

router.get("/pending-orders", verifyDMLogin, async (req, res) => {
  try {
    const deliveryManId = req.staffId;
    const pendingOrders = await Order.find({
      status: "In Progress",
      deliveryMan: deliveryManId
    })
      .populate("deliveryAddress", ["-__v"], "address")
      .populate("user", ["-__v", "-password"]);
    if (pendingOrders.length > 0) {
      res.status(200).json({ success: true, pendingOrders: pendingOrders });
    } else {
      res
        .status(400)
        .json({ success: false, error: "No pending orders found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
});

router.get(
  "/:orderId",
  param("orderId").isMongoId(),
  verifyDMLogin,
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        const deliveryManId = req.staffId;
        const orderId = req.params.orderId;
        const order = await Order.findOne({
          _id: orderId,
          deliveryMan: deliveryManId
        })
          .populate("deliveryAddress", ["-__v"], "address")
          .populate("user", ["-__v", "-password"]);
        if (order) {
          res.status(200).json({ success: true, order });
        } else {
          res.status(400).json({ success: false, error: "No order is found" });
        }
      } else {
        res.status(400).json({ success: false, error: result.errors });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Error Occurred on Server Side",
        message: error.message
      });
    }
  }
);
export default router;
