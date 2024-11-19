import express from "express";
import multer from "multer";
import verifyAdPMLogin from "../middlewares/verifyAdPMLogin.js";
import ProductImage from "../models/images.js";
import { param, validationResult } from "express-validator";
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
router
  .route("/:productId")
  .get(verifyAdPMLogin, param("productId").isMongoId(), async (req, res) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        const productId = req.params.productId;
        const productImages = await ProductImage.find({ product: productId });
        if (productImages.length === 0) {
          res.status(400).json({
            success: false,
            error: "No images found for that product"
          });
        } else {
          res.status(200).json({ success: true, images: productImages });
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
  });
export default router;
