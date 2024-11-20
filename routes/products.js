import express from "express";
const router = express.Router();
import productsController from "../controllers/productsController.js";
import verifyAdPMLogin from "../middlewares/verifyAdPMLogin.js";
import { body, param } from "express-validator";
router
  .route("/")
  .get(productsController.getAllProducts)
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
    productsController.addNewProduct
  );
router
  .route("/:productId")
  .get(param("productId").isMongoId(), productsController.getSingleProduct)
  .delete(
    verifyAdPMLogin,
    param("productId"),
    productsController.deleteSingleProduct
  )
  .put(
    verifyAdPMLogin,
    param("productId").isMongoId(),
    [
      body("pname")
        .matches(/^[a-zA-Z0-9 ]+$/)
        .isLength({ min: 8 })
        .optional(),
      body("description")
        .matches(/^[a-zA-Z0-9 ]+$/)
        .isLength({ min: 20 })
        .optional(),
      body("price").isNumeric().optional(),
      body("category").isAlpha().isIn(["Laptop", "Accessory"]).optional(),
      body("status").isAlpha().isIn(["Used", "New"]).optional(),
      body("stock").isNumeric().optional(),
      body("discount").isNumeric().optional(),
      body("brand")
        .matches(/^[a-zA-Z0-9 ]+$/)
        .isLength({ min: 2 })
        .optional(),
      body("sold").isNumeric().optional()
    ],
    productsController.updateExistingProduct
  );
export default router;
