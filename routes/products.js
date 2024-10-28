import express from "express";
const router = express.Router();
import Product from "../models/products.js";
import ProductImage from "../models/Images.js";
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    if (products.length > 0) {
      const allProducts = await Promise.all(
        products.map(async (product) => {
          const productImage = await ProductImage.findById(product.imageId);
          return {
            ...product._doc,
            images: productImage
          };
        })
      );
      res.status(200).json({ success: true, products: allProducts });
    } else {
      res.status(200).json({ success: true, products: [] });
    }
  } catch {
    res
      .status(500)
      .json({ success: false, msg: "Some Error on Server Occurred!" });
  }
});
export default router;
