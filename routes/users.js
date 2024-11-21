import express from "express";
import User from "../models/users.js";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
const router = express.Router();
router.route("/").post([
  body("username")
    .matches(/^[a-zA-Z0-9 ]+$/)
    .isLength({ min: 6, max: 20 }),
  body("firstName")
    .matches(/^[a-zA-Z ]+$/)
    .isLength({ min: 3, max: 24 }),
  body("lastName")
    .matches(/^[a-zA-Z ]+$/)
    .isLength({ min: 3, max: 28 }),
  body("gender").isIn(["Male", "Female"]).isLength({ min: 4, max: 6 }),
  body("email").isEmail(),
  body(
    "password",
    "Password must contain at Least 3 numbers, 3 lowercase chars, 1 symbol and 1 uppercase char"
  ).isStrongPassword({
    minLength: 8,
    minNumbers: 3,
    minLowercase: 3,
    minSymbols: 1,
    minUppercase: 1
  }),
  body("dob").isISO8601({ strict: true, strictSeparator: true }),
  body("country").matches(/^[a-zA-Z ]+$/),
  body("state").matches(/^[a-zA-Z ]+$/),
  body("city").matches(/^[a-zA-Z ]+$/),
  body("postalCode").isPostalCode("any"),
  body("fullAddress").isString().isLength({ min: 4 }),
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        const {
          username,
          firstName,
          lastName,
          gender,
          email,
          dob,
          password,
          country,
          city,
          state,
          postalCode,
          fullAddress
        } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = {
          username,
          firstName,
          lastName,
          gender,
          email,
          password: hashedPassword,
          dob,
          homeAddress: {
            country,
            state,
            city,
            postalCode,
            fullAddress
          }
        };
        User.create(newUser)
          .then(() => {
            res.status(200).json({
              success: true,
              msg: "Your account created successfully"
            });
          })
          .catch((err) => {
            res.status(400).json({ success: false, error: err.message });
          });
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
]);
export default router;
