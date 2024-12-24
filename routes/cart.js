import express from "express";
import Cart from "../models/cart.js";
const router = express.Router();
import verifyUserLogin from "../middlewares/verifyUserLogin.js";

router.route("/").get(verifyUserLogin, async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.find({ userId: userId });
    if (cart) {
      res.status(200).json({
        success: true,
        cart: cart
      });
    } else {
      res.status(404).json({
        success: false,
        message: "Cart Not Found"
      });
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
