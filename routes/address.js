import express from "express";
import verifyUserLogin from "../middlewares/verifyUserLogin.js";
import { body, param } from "express-validator";
import addressController from "../controllers/addressController.js";
const router = express.Router();
router
  .route("/")
  .post(
    verifyUserLogin,
    [
      body("country").matches(/^[a-zA-Z ]+$/),
      body("state").matches(/^[a-zA-Z ]+$/),
      body("city").matches(/^[a-zA-Z ]+$/),
      body("postalCode").isPostalCode("any"),
      body("fullAddress").isString().isLength({ min: 4 }),
      body("isDefault").isBoolean()
    ],
    addressController.addNewAddress
  )
  .get(verifyUserLogin, addressController.getDefaultAddress)
  .delete(verifyUserLogin, addressController.deleteDefaultAddress);
router
  .route("/all-addresses")
  .get(verifyUserLogin, addressController.getAllAddresses)
  .delete(verifyUserLogin, addressController.deleteAllAddresses);

router
  .route("/all-addresses/:addressId")
  .get(
    verifyUserLogin,
    param("addressId").isMongoId(),
    addressController.getParticularAddress
  )
  .delete(
    verifyUserLogin,
    param("addressId").isMongoId(),
    addressController.deleteParticularAddress
  )
  .put(
    verifyUserLogin,
    param("addressId"),
    [
      body("country")
        .matches(/^[a-zA-Z ]+$/)
        .optional(),
      body("state")
        .matches(/^[a-zA-Z ]+$/)
        .optional(),
      body("city")
        .matches(/^[a-zA-Z ]+$/)
        .optional(),
      body("postalCode").isPostalCode("any").optional(),
      body("fullAddress").isString().isLength({ min: 4 }).optional(),
      body("isDefault").isBoolean().optional()
    ],
    addressController.updateParticularAddress
  );
export default router;
