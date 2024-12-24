import express from "express";
import verifyUserLogin from "../middlewares/verifyUserLogin.js";
import { param } from "express-validator";
const router = express.Router();
import orderItemController from "../controllers/orderItemController.js";

router.get(
  "/:orderId",
  verifyUserLogin,
  param("orderId").isMongoId(),
  orderItemController.getAllOrderItems
);

export default router;
