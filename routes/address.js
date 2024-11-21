import express from "express";
import Address from "../models/addresses.js";
import verifyUserLogin from "../middlewares/verifyUserLogin.js";
import { body, validationResult } from "express-validator";
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
    async function (req, res) {
      try {
        const result = validationResult(req);
        if (result.isEmpty()) {
          const userId = req.userId;
          let newAddress = req.body;
          newAddress.user = userId;
          if (newAddress.isDefault) {
            const defaultAddress = await Address.findOne({
              isDefault: true,
              user: userId
            });
            if (defaultAddress) {
              res.status(400).json({
                success: false,
                error: "A Default Address already exists"
              });
            } else {
              Address.create(newAddress).then(() => {
                res
                  .status(200)
                  .json({
                    success: true,
                    msg: "New Address created successfully"
                  })
                  .catch((err) => {
                    res
                      .status(400)
                      .json({ success: false, error: err.message });
                  });
              });
            }
          } else {
            Address.create(newAddress)
              .then(() => {
                res.status(200).json({
                  success: true,
                  msg: "New Address created successfully"
                });
              })
              .catch((err) => {
                res.status(400).json({ success: false, error: err.message });
              });
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
    }
  );
export default router;