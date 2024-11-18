import express from "express";
const router = express.Router();
import Product from "../models/products.js";
import ProductImage from "../models/images.js";
import verifyAdPMLogin from "../middlewares/verifyAdPMLogin.js";
import { body, validationResult } from "express-validator";
router
  .route("/")
  .get(async (req, res) => {
    try {
      const products = await Product.find();
      if (products.length > 0) {
        const allProducts = await Promise.all(
          products.map(async (product) => {
            const productImage = await ProductImage.findOne({
              product: product.id
            });
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
  })
  .post(
    verifyAdPMLogin,
    [
      body("pname")
        .matches(/^[a-zA-Z0-9 ]+$/)
        .isLength({ min: 8 }),
      body("description")
        .matches(/^[a-zA-Z0-9 ]+$/)
        .isLength({ min: 20 }),
      body("price").isNumeric(),
      body("category").isAlpha().isIn(["Laptop", "Accessory"]),
      body("status").isAlpha().isIn(["Used", "New"]).optional(),
      body("stock").isNumeric(),
      body("discount").isNumeric().optional(),
      body("brand")
        .matches(/^[a-zA-Z0-9 ]+$/)
        .isLength({ min: 2 }),
      body("sold").isNumeric().optional()
    ],
    async (req, res) => {
      try {
        const result = validationResult(req);
        if (result.isEmpty()) {
          const staffMemberId = req.staffId;
          let newProduct = req.body;
          newProduct.productCreator = staffMemberId;
          Product.create(newProduct)
            .then(() => {
              res.status(200).json({
                success: true,
                msg: "Added new product"
              });
            })
            .catch((error) => {
              res.status(400).json({ success: false, error: error.message });
            });
        } else {
          res.status(400).json({
            success: false,
            error: result.errors
          });
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
