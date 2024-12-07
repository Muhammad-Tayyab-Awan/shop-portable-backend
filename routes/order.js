import express from "express";
const router = express.Router();
import Order from "../models/orders.js";
import Address from "../models/addresses.js";
import Product from "../models/products.js";
import OrderItem from "../models/orderItems.js";
import verifyUserLogin from "../middlewares/verifyUserLogin.js";
import verifyAdminLogin from "../middlewares/verifyAdminLogin.js";
import transporter from "../mailTransporter.js";
import Staff from "../models/staff.js";
import { body, param, validationResult } from "express-validator";
import validator from "validator";
router
  .route("/")
  .get(verifyUserLogin, async (req, res) => {
    try {
      const userId = req.userId;
      const allOrders = await Order.find({ user: userId }).populate(
        "deliveryAddress",
        ["-_id", "-user", "-__v"],
        "address"
      );
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
  })
  .post(
    verifyUserLogin,
    [
      body("deliveryAddress").isMongoId(),
      body("orderItems")
        .isArray({ min: 1 })
        .custom((orderItems) => {
          for (const orderItem of orderItems) {
            if (!validator.isMongoId(orderItem.productId)) {
              throw new Error("Invalid MongoDB ID format in productId");
            }
            if (typeof orderItem.itemCount !== "number") {
              throw new Error(
                "Each product must have an itemCount of type number"
              );
            }
          }
          return true;
        })
    ],
    async (req, res) => {
      try {
        const result = validationResult(req);
        if (result.isEmpty()) {
          const userId = req.userId;
          let orderInfo = req.body;
          const deliveryAddress = await Address.findById(
            orderInfo.deliveryAddress
          );
          if (deliveryAddress && deliveryAddress.user.toString() === userId) {
            let orderedItems = 0;
            for (const orderItem of orderInfo.orderItems) {
              const product = await Product.findById(orderItem.productId);
              if (product) {
                const availableCount = product.stock - product.sold;
                if (
                  availableCount >= orderItem.itemCount &&
                  orderItem.itemCount > 0
                ) {
                  orderedItems++;
                }
              }
            }
            if (orderedItems === orderInfo.orderItems.length) {
              const newOrder = await Order.create({
                user: userId,
                deliveryAddress: orderInfo.deliveryAddress
              });
              for (const orderItem of orderInfo.orderItems) {
                const product = await Product.findById(orderItem.productId);
                orderItem.orderId = newOrder.id;
                orderItem.totalPrice =
                  (product.price - (product.price * product.discount) / 100) *
                  orderItem.itemCount;
                await OrderItem.create(orderItem);
                product.sold = product.sold + orderItem.itemCount;
                await product.save();
              }
              const allOrderedItems = await OrderItem.find({
                orderId: newOrder.id
              });
              let totalPrice = 0;
              allOrderedItems.forEach((item) => {
                totalPrice += item.totalPrice;
              });
              await Order.findByIdAndUpdate(newOrder.id, {
                totalPrice: totalPrice
              });
              const admins = await Staff.find({
                role: "admin",
                emailVerified: true
              }).select("email");
              const htmlMessage = `<h1 style="text-align:center;">New Order</h1><p style="text-align:center;">Dear Admin! New Order with id <i>${newOrder.id}</i> created. Visit dashboard for further steps</p>`;
              transporter.sendMail(
                {
                  to: admins,
                  subject: "New Order",
                  html: htmlMessage
                },
                (error) => {
                  if (error) {
                    res.status(500).json({
                      success: false,
                      error: "Error Occurred on Server Side",
                      message: error.message
                    });
                  } else {
                    res.status(200).json({
                      success: true,
                      error: "Your order created successfully"
                    });
                  }
                }
              );
            } else {
              res
                .status(400)
                .json({ success: false, error: "Invalid OrderItems Detail" });
            }
          } else {
            res
              .status(400)
              .json({ success: false, error: "Invalid delivery address" });
          }
        } else {
          res.status(200).json({ success: false, error: result.errors });
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
router.put(
  "/assign-order/:orderId",
  verifyAdminLogin,
  param("orderId")
    .isMongoId()
    .custom(async (orderId) => {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error("Order with that id is not present");
      }
      if (order.status !== "In Progress") {
        throw new Error(`Order status is ${order.status}`);
      }
      if (order.deliveryMan !== undefined) {
        throw new Error("Order is already assigned to another delivery man");
      }
      return true;
    }),
  body("deliveryMan")
    .isMongoId()
    .custom(async (deliveryMan) => {
      const deliveryManStaffMember = await Staff.findById(deliveryMan);
      if (
        !deliveryManStaffMember ||
        deliveryManStaffMember.role !== "deliveryMan" ||
        deliveryManStaffMember.emailVerified !== true
      ) {
        throw new Error("No delivery man with given id exist in your staff");
      }
      return true;
    }),
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        const orderId = req.params.orderId;
        const { deliveryMan } = req.body;
        const deliveryManData = await Staff.findById(deliveryMan);
        await Order.findByIdAndUpdate(orderId, { deliveryMan: deliveryMan });
        const htmlMessage = `<h1 style="text-align:center;">Order Assignment</h1><p style="text-align:center;">Dear ${deliveryManData.username}! A new order with id ${orderId} has assigned to you. Visit your dashboard for further info.</p>`;
        transporter.sendMail(
          {
            to: deliveryManData.email,
            subject: "Order Assignment",
            html: htmlMessage
          },
          (error) => {
            if (error) {
              res.status(500).json({
                success: false,
                error: "Error Occurred on Server Side",
                message: error.message
              });
            } else {
              res.status(200).json({
                success: true,
                error: `Order is assigned to ${deliveryManData.username}`
              });
            }
          }
        );
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
router.get(
  "/cancel-order/:orderId",
  verifyUserLogin,
  param("orderId").isMongoId(),
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        const userId = req.userId,
          orderId = req.params.orderId;
        const order = await Order.findById(orderId);
        if (order && order.user.toString() === userId) {
          if (order.status === "In Progress") {
            const orderItems = await OrderItem.find({ orderId: orderId });
            orderItems.forEach(async (orderItem) => {
              const product = await Product.findById(orderItem.productId);
              product.sold = product.sold - orderItem.itemCount;
              await product.save();
            });
            order.canceledOn = Date.now();
            order.status = "Canceled";
            await order.save();
            res
              .status(200)
              .json({ success: true, msg: "Your order is canceled now" });
          } else {
            res.status(400).json({
              success: false,
              error: `Order is already ${order.status.toLowerCase()}`
            });
          }
        } else {
          res.status(400).json({ success: false, error: "No order found" });
        }
      } else {
        rs.status(400).json({ success: false, error: result.errors });
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

router.get(
  "/cancel-user-order/:orderId",
  verifyAdminLogin,
  param("orderId").isMongoId(),
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        const orderId = req.params.orderId;
        const order = await Order.findById(orderId);
        if (order) {
          if (order.status === "In Progress") {
            const orderItems = await OrderItem.find({ orderId: orderId });
            orderItems.forEach(async (orderItem) => {
              const product = await Product.findById(orderItem.productId);
              product.sold = product.sold - orderItem.itemCount;
              await product.save();
            });
            order.canceledOn = Date.now();
            order.status = "Canceled";
            await order.save();
            res
              .status(200)
              .json({ success: true, msg: "Your order is canceled now" });
          } else {
            res.status(400).json({
              success: false,
              error: `Order is already ${order.status.toLowerCase()}`
            });
          }
        } else {
          res.status(400).json({ success: false, error: "No order found" });
        }
      } else {
        rs.status(400).json({ success: false, error: result.errors });
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
