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
const updateValidations = [
  body("username")
    .matches(/^(?=.*[a-z])(?=.*\d)[a-z\d]+$/)
    .isLength({ min: 6, max: 20 })
    .optional(),
  body("firstName").isAlpha().isLength({ min: 3, max: 24 }).optional(),
  body("lastName").isAlpha().isLength({ min: 3, max: 28 }).optional(),
  body("gender")
    .isAlpha()
    .isLength({ min: 4, max: 6 })
    .isIn(["Male", "Female"])
    .optional(),
  body("dob").isISO8601({ strict: true, strictSeparator: true }).optional(),
  body("country").isAlpha().optional(),
  body("state").isAlpha().optional(),
  body("city").isAlpha().optional(),
  body("postalCode").isPostalCode("any").optional(),
  body("fullAddress").isString().isLength({ min: 4 }).optional()
];
router.put("/updateuser", updateValidations, verifyLogin, async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const staffMember = await Staff.findById(req.staffId).select("-password");
      if (staffMember) {
        const {
          username,
          firstName,
          lastName,
          gender,
          dob,
          country,
          state,
          city,
          postalCode,
          fullAddress
        } = req.body;
        const updatedFields = {
          username,
          firstName,
          lastName,
          gender,
          dob,
          homeAddress: {
            country: country || staffMember.homeAddress.country,
            state: state || staffMember.homeAddress.state,
            city: city || staffMember.homeAddress.city,
            postalCode: postalCode || staffMember.homeAddress.postalCode,
            fullAddress: fullAddress || staffMember.homeAddress.fullAddress
          }
        };
        Staff.findByIdAndUpdate(req.staffId, updatedFields, {
          new: true,
          select: "-password -email"
        })
          .then(() => {
            res.status(200).json({
              success: true,
              msg: "Staff Member's User Data Updated Successfully"
            });
          })
          .catch((error) => {
            res.status(400).json({
              success: false,
              error: `${error.errorResponse.codeName} error Occurred`
            });
          });
      } else {
        res.status(403).json({ success: false, error: "Token is Tempered" });
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
});
router.get("/deleteuser", verifyLogin, async (req, res) => {
  try {
    const staffMember = await Staff.findById(req.staffId).select("-password");
    if (staffMember) {
      Staff.findByIdAndDelete(req.staffId)
        .then(() => {
          res.status(200).json({
            success: true,
            msg: "Your staff member account deleted successfully"
          });
        })
        .catch((error) => {
          res.status(400).json({
            success: false,
            error: `${error.errorResponse.codeName} error Occurred`
          });
        });
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
