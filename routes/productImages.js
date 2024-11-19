import express from "express";
import multer from "multer";
import verifyAdPMLogin from "../middlewares/verifyAdPMLogin.js";
import productImageController from "../controllers/productImageController.js";
import { param } from "express-validator";
const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
router
  .route("/")
  .get(verifyAdPMLogin, productImageController.getAllProdImagesAdPM);
router
  .route("/:productId")
  .get(
    verifyAdPMLogin,
    param("productId").isMongoId(),
    productImageController.getProdImageAdPM
  )
  .post(
    verifyAdPMLogin,
    param("productId").isMongoId(),
    upload.single("productImage"),
    productImageController.uploadProdImageAdPM
  )
  .delete(
    verifyAdPMLogin,
    param("productId"),
    productImageController.deleteProdImagesAdPM
  );

router
  .route("/image/:imageId")
  .get(
    verifyAdPMLogin,
    param("imageId").isMongoId(),
    productImageController.getProdImageByIdAdPM
  )
  .delete(
    verifyAdPMLogin,
    param("imageId"),
    productImageController.deleteProdImageById
  );
export default router;
