import express from "express";
const router = express.Router();
import verifyDMLogin from "../middlewares/verifyDMLogin.js";
import { param } from "express-validator";
import deliverController from "../controllers/deliverController.js";

router.get("/", verifyDMLogin, deliverController.getAllOrders);

router.get(
  "/canceled-orders",
  verifyDMLogin,
  deliverController.getAllCanceledOrders
);

router.get(
  "/completed-orders",
  verifyDMLogin,
  deliverController.getAllCompletedOrders
);

router.get(
  "/pending-orders",
  verifyDMLogin,
  deliverController.getAllPendingOrders
);

router.get(
  "/:orderId",
  param("orderId").isMongoId(),
  verifyDMLogin,
  deliverController.getSingleOrder
);
export default router;
