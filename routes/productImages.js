import express from "express";
import multer from "multer";
import verifyAdPMLogin from "../middlewares/verifyAdPMLogin.js";
import ProductImage from "../models/images.js";
const router = express.Router();
router.route("/").get(verifyAdPMLogin, async (req, res) => {
  try {
    const allProductsImages = await ProductImage.find();
    res
      .status(200)
      .json({ success: true, allProductsImages: allProductsImages });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
});
export default router;
