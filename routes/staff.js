import express from "express";
import bcrypt from "bcryptjs";
import expressValidator from "express-validator";
const { body, validationResult } = expressValidator;
import JWT from "jsonwebtoken";
import Staff from "../models/staff.js";
import transporter from "../mailTransporter.js";
const PORT = process.env.PORT || 3000;
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
            if (staffMember.emailVerified) {
              let token = JWT.sign({ id: staffMember.id }, JWT_SECRET);
              res.status(200).json({ success: true, authToken: token });
            } else {
              const verificationToken = JWT.sign(
                { id: staffMember.id },
                JWT_SECRET
              );
              const htmlMessage = `<h3 style="text-align:center;width:100%;">Verify Your Email</h3><p style="text-align:center;width:100%;">Visit this link to verify your email <a href="http://localhost:${PORT}/api/staff/verify-email/${verificationToken}">http://localhost:${PORT}/api/staff/verify-email/${verificationToken}</a></p>`;
              transporter.sendMail(
                {
                  to: staffMember.email,
                  subject: "Email Verification",
                  html: htmlMessage
                },
                (error) => {
                  if (error) {
                    res.status(500).json({
                      success: false,
                      error: "Error Occurred on Server Side",
                      message: error.message
                    });
                  } else {
                    res.status(200).json({
                      success: true,
                      error: `We have sent verification email to ${staffMember.email},Check your mailbox and verify your email`
                    });
                  }
                }
              );
            }
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
router.get("/verify-email/:verificationToken", async (req, res) => {
  try {
    const verificationToken = req.params.verificationToken;
    JWT.verify(verificationToken, JWT_SECRET, async (error, response) => {
      if (error) {
        res.status(403).json({
          status: false,
          error: "Token is not valid!"
        });
      } else {
        const staffMemberId = response.id;
        const staffMember = await Staff.findById(staffMemberId).select(
          "-password"
        );
        if (staffMember) {
          if (staffMember.emailVerified) {
            res
              .status(400)
              .json({ success: false, error: "Email already verified" });
          } else {
            await Staff.findByIdAndUpdate(staffMemberId, {
              emailVerified: true
            }).select("-password");
            res.status(200).json({
              success: true,
              msg: "Email Verified Successfully,Now you can login into your account"
            });
          }
        } else {
          res.status(403).json({ success: false, error: "Token is Tempered" });
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
});
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
