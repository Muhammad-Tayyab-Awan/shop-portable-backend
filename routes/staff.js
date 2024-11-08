import express from "express";
import bcrypt from "bcryptjs";
import expressValidator from "express-validator";
const { body, validationResult } = expressValidator;
import JWT from "jsonwebtoken";
import Staff from "../models/staff.js";
import User from "../models/users.js";
import Address from "../models/addresses.js";
import verifyLogin from "../middlewares/verifyLogin.js";
const JWT_SECRET = process.env.JWT_SECRET;
const router = express.Router();
router.post(
  "/login",
  [
    body("email", "Please Enter Correct Email").isEmail(),
    body(
      "password",
      "Password must contain at Least 3 numbers, 3 lowercase chars, 1 symbol and 1 uppercase char"
    ).isStrongPassword({
      minLength: 8,
      minNumbers: 3,
      minLowercase: 3,
      minSymbols: 1,
      minUppercase: 1
    })
  ],
  async (req, res) => {
    try {
      let result = validationResult(req);
      if (result.isEmpty()) {
        let staffMemberCredentials = req.body;
        let staffMember = await Staff.findOne({
          email: staffMemberCredentials.email
        });
        if (staffMember) {
          let comparePassword = await bcrypt.compare(
            staffMemberCredentials.password,
            staffMember.password
          );
          if (comparePassword) {
            let token = JWT.sign({ id: staffMember.id }, JWT_SECRET);
            res.status(200).json({ success: true, authToken: token });
          } else {
            res.status(400).json({
              success: false,
              error: "Invalid credentials! Please Enter Correct credentials"
            });
          }
        } else {
          res.status(400).json({
            success: false,
            error: "Invalid credentials! Please Enter Correct credentials"
          });
        }
      } else {
        return res.status(400).json({ success: false, errors: result.errors });
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
router.get("/getuser", verifyLogin, async (req, res) => {
  try {
    const staffMember = await Staff.findById(req.staffId).select("-password");
    if (staffMember) {
      res.status(200).json({ success: true, staffMember });
    } else {
      res.status(403).json({ success: false, error: "Token is Tempered" });
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
