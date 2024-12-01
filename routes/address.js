import express from "express";
import Address from "../models/addresses.js";
import verifyUserLogin from "../middlewares/verifyUserLogin.js";
import { body, param, validationResult } from "express-validator";
import User from "../models/users.js";
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
  )
  .get(verifyUserLogin, async (req, res) => {
    try {
      const userId = req.userId;
      const defaultAddress = await Address.findOne({
        user: userId,
        isDefault: true
      });
      if (defaultAddress) {
        res.status(200).json({ success: true, defaultAddress: defaultAddress });
      } else {
        res
          .status(400)
          .json({ success: false, error: "No default address found" });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Error Occurred on Server Side",
        message: error.message
      });
    }
  })
  .delete(verifyUserLogin, async (req, res) => {
    try {
      const userId = req.userId;
      const defaultAddress = await Address.findOne({
        user: userId,
        isDefault: true
      });
      if (defaultAddress) {
        await Address.findOneAndDelete({ user: userId, isDefault: true });
        res.status(200).json({
          success: true,
          msg: "User's default address deleted successfully"
        });
      } else {
        res.status(400).json({
          success: false,
          error: "No default address present for current user"
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
router
  .route("/all-addresses")
  .get(verifyUserLogin, async (req, res) => {
    try {
      const userId = req.userId;
      const allAddresses = await Address.find({ user: userId });
      if (allAddresses.length > 0) {
        res.status(200).json({ success: true, allAddresses: allAddresses });
      } else {
        res.status(400).json({
          success: false,
          error: "No addresses found for current user"
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Error Occurred on Server Side",
        message: error.message
      });
    }
  })
  .delete(verifyUserLogin, async (req, res) => {
    try {
      const userId = req.userId;
      const allAddresses = await Address.find({ user: userId });
      if (allAddresses.length > 0) {
        await Address.deleteMany({ user: userId });
        res.status(200).json({
          success: true,
          msg: "Deleted all addresses of current user"
        });
      } else {
        res.status(400).json({
          success: false,
          error: "No addresses found for current user"
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

router
  .route("/all-addresses/:addressId")
  .get(verifyUserLogin, param("addressId").isMongoId(), async (req, res) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        const userId = req.userId;
        const addressId = req.params.addressId;
        const address = await Address.findById(addressId);
        if (address && address.user.toString() === userId) {
          res.status(200).json({ success: true, address: address });
        } else {
          res
            .status(400)
            .json({ success: false, error: "No address found with that id" });
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
  })
  .delete(verifyUserLogin, param("addressId").isMongoId(), async (req, res) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        const userId = req.userId;
        const addressId = req.params.addressId;
        const address = await Address.findById(addressId);
        if (address && address.user.toString() === userId) {
          await Address.findByIdAndDelete(addressId);
          res
            .status(200)
            .json({ success: true, msg: "Address deleted successfully" });
        } else {
          res
            .status(400)
            .json({ success: false, error: "No address found with that id" });
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
