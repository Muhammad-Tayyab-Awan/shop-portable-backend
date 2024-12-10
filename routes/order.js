import express from "express";
const router = express.Router();
import Order from "../models/orders.js";
import verifyUserLogin from "../middlewares/verifyUserLogin.js";
import verifyAdminLogin from "../middlewares/verifyAdminLogin.js";
import verifyAdDMLogin from "../middlewares/verifyAdDMLogin.js";
import Staff from "../models/staff.js";
import User from "../models/users.js";
import { body, param, query } from "express-validator";
import validator from "validator";
import orderController from "../controllers/orderController.js";
router
  .route("/")
  .get(verifyUserLogin, orderController.getAllOrderLoggedUser)
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
    orderController.createOrderLoggedUser
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
  orderController.assignOrderAdmin
);
router.get(
  "/cancel-order/:orderId",
  verifyUserLogin,
  param("orderId").isMongoId(),
  orderController.cancelOrderLoggedUser
);

router.get(
  "/cancel-user-order/:orderId",
  verifyAdminLogin,
  param("orderId").isMongoId(),
  orderController.cancelOrderAdmin
);

router.get(
  "/delivered/:orderId",
  verifyAdDMLogin,
  param("orderId").isMongoId(),
  orderController.deliverOrderAdDm
);

router.post(
  "/add-items/:orderId",
  verifyUserLogin,
  body("orderItems")
    .isArray({ min: 1 })
    .custom((orderItems) => {
      for (const orderItem of orderItems) {
        if (!validator.isMongoId(orderItem.productId)) {
          throw new Error("Invalid MongoDB ID format in productId");
        }
        if (typeof orderItem.itemCount !== "number") {
          throw new Error("Each product must have an itemCount of type number");
        }
      }
      return true;
    }),
  param("orderId").isMongoId(),
  body(),
  orderController.addOrderItemLoggedUser
);

router.get(
  "/remove-item/:orderId/:productId",
  verifyUserLogin,
  [param("orderId").isMongoId(), param("productId").isMongoId()],
  orderController.removeOrderItemLoggedUser
);

router.get(
  "/canceled-orders",
  verifyUserLogin,
  orderController.getCanceledOrdersLoggedUser
);

router.get(
  "/delivered-orders",
  verifyUserLogin,
  orderController.getDeliveredOrdersLoggedUser
);

router.get(
  "/on-way-orders",
  verifyUserLogin,
  orderController.getOnWayOrdersLoggedUser
);

router.get(
  "/pending-orders",
  verifyUserLogin,
  orderController.getPendingOrdersLoggedUser
);

router.get(
  "/all-orders",
  verifyAdminLogin,
  query("status")
    .isIn(["canceled", "delivered", "pending", "on-way"])
    .optional(),
  orderController.getAllOrdersAdmin
);

router.get(
  "/all-orders/:userId",
  verifyAdminLogin,
  param("userId")
    .isMongoId()
    .custom(async (userId) => {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User with that id is not present");
      }
      if (user.emailVerified !== true) {
        throw new Error("User with that id is not present");
      }
      return true;
    }),
  query("status")
    .isIn(["canceled", "delivered", "pending", "on-way"])
    .optional(),
  orderController.getAllOrdersParticularUserAdmin
);

router.get(
  "/all-assigned-orders/:deliveryManId",
  param("deliveryManId")
    .isMongoId()
    .custom(async (deliveryManId) => {
      const deliveryMan = await Staff.findById(deliveryManId);
      if (!deliveryMan) {
        throw new Error("Delivery Man with that id is not present");
      }
      if (deliveryMan.emailVerified !== true) {
        throw new Error("Delivery Man with that id is not present");
      }
      if (deliveryMan.role !== "deliveryMan") {
        throw new Error("Delivery Man with that id is not present");
      }
      return true;
    }),
  query("status").isIn(["to-deliver", "canceled", "delivered"]).optional(),
  verifyAdminLogin,
  orderController.getAllOrdersParticularDeliveryManAdmin
);
export default router;
