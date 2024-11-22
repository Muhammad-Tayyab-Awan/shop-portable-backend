import express from "express";
import User from "../models/users.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;
import transporter from "../mailTransporter.js";
import verifyUserLogin from "../middlewares/verifyUserLogin.js";
import { body, param, validationResult } from "express-validator";
const router = express.Router();
router
  .route("/")
  .post(
    [
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
      body("fullAddress").isString().isLength({ min: 4 })
    ],
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
  )
  .get(verifyUserLogin, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await User.findById(userId).select("-password");
      res.status(200).json({ success: true, user: user });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Error Occurred on Server Side",
        message: error.message
      });
    }
  })
  .put(
    verifyUserLogin,
    [
      body("username")
        .matches(/^[a-zA-Z0-9 ]+$/)
        .isLength({ min: 6, max: 20 })
        .optional(),
      body("firstName")
        .matches(/^[a-zA-Z ]+$/)
        .isLength({ min: 3, max: 24 })
        .optional(),
      body("lastName")
        .matches(/^[a-zA-Z ]+$/)
        .isLength({ min: 3, max: 28 })
        .optional(),
      body("gender")
        .isIn(["Male", "Female"])
        .isLength({ min: 4, max: 6 })
        .optional(),
      body("email").isEmail().optional(),
      body("dob").isISO8601({ strict: true, strictSeparator: true }).optional(),
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
      body("fullAddress").isString().isLength({ min: 4 }).optional()
    ],
    async (req, res) => {
      try {
        const result = validationResult(req);
        if (result.isEmpty()) {
          const userId = req.userId;
          const user = await User.findById(userId);
          const {
            username,
            firstName,
            lastName,
            email,
            gender,
            dob,
            country,
            state,
            city,
            postalCode,
            fullAddress
          } = req.body;
          const updatedUser = {
            username,
            firstName,
            lastName,
            email,
            emailVerified:
              email && email !== user.email ? false : user.emailVerified,
            gender,
            dob,
            homeAddress: {
              country: country || user.homeAddress.country,
              state: state || user.homeAddress.state,
              city: city || user.homeAddress.city,
              postalCode: postalCode || user.homeAddress.postalCode,
              fullAddress: fullAddress || user.homeAddress.fullAddress
            }
          };
          User.findByIdAndUpdate(userId, updatedUser, {
            new: true,
            select: "-password -email"
          })
            .then(() => {
              res.status(200).json({
                success: true,
                msg: `Dear ${user.username} you data updated successfully`
              });
            })
            .catch((error) => {
              res.status(400).json({
                success: false,
                error: `${error.errorResponse.codeName} error Occurred`
              });
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
  )
  .delete(verifyUserLogin, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await User.findById(userId).select("-password");
      const deletionToken = JWT.sign({ id: userId }, JWT_SECRET);
      const htmlMessage = `<h1 style="text-align:center;width:100%">Account Deletion</h1><p style="text-align:center;width:100%">Dear ${user.firstName}&nbsp;${user.lastName}, Do You really want to delete your account permanently?</p><p style="text-align:center;"><a href="http://localhost:${PORT}/api/users/confirm-delete/${deletionToken}" style="background-color:#f00;color:white;font-weight:bold;text-decoration:none;text-align:center;padding: 3px 10px;border-radius:5px;">Yes</a>&nbsp;&nbsp;<a href="http://localhost:${PORT}/api/users/cancel-delete/${deletionToken}" style="background-color:#0f0;color:white;font-weight:bold;text-decoration:none;text-align:center;padding: 3px 10px;border-radius:5px;">No</a></p>`;
      transporter.sendMail(
        {
          to: user.email,
          subject: "Account Deletion Confirmation",
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
              error: `We have sent account deletion confirmation email to ${user.email},Check your mailbox`
            });
          }
        }
      );
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Error Occurred on Server Side",
        message: error.message
      });
    }
  });
router.get(
  "/confirm-delete/:deletionToken",
  param("deletionToken").isJWT(),
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        const deletionToken = req.params.deletionToken;
        JWT.verify(deletionToken, JWT_SECRET, async (error, response) => {
          if (error) {
            res.status(403).json({
              status: false,
              error: "Token is not valid!"
            });
          } else {
            const userId = response.id;
            const user = await User.findById(userId).select("-password");
            if (user) {
              await User.findByIdAndDelete(userId).select("-password");
              res.status(200).json({
                success: true,
                msg: `Dear ${user.firstName} ${user.lastName}, Your account is successfully deleted`
              });
            } else {
              res
                .status(403)
                .json({ success: false, error: "Token is Tempered" });
            }
          }
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
);

router.get(
  "/cancel-delete/:deletionToken",
  param("deletionToken"),
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        const deletionToken = req.params.deletionToken;
        JWT.verify(deletionToken, JWT_SECRET, async (error, response) => {
          if (error) {
            res.status(403).json({
              status: false,
              error: "Token is not valid!"
            });
          } else {
            const userId = response.id;
            const user = await User.findById(userId).select("-password");
            if (user) {
              res.status(200).json({
                success: true,
                msg: "Your account deletion request cancelled"
              });
            } else {
              res
                .status(403)
                .json({ success: false, error: "Token is Tempered" });
            }
          }
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
);
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
      const result = validationResult(req);
      if (result.isEmpty()) {
        const { email, password } = req.body;
        const logInUser = await User.findOne({ email: email });
        if (logInUser) {
          const passwordMatch = await bcrypt.compare(
            password,
            logInUser.password
          );
          if (passwordMatch) {
            if (logInUser.emailVerified) {
              const token = JWT.sign({ id: logInUser.id }, JWT_SECRET);
              res.status(200).json({ success: true, authToken: token });
            } else {
              const verificationToken = JWT.sign(
                { id: logInUser.id },
                JWT_SECRET
              );
              const htmlMessage = `<h3 style="text-align:center;width:100%;">Verify Your Email</h3><p style="text-align:center;width:100%;">Visit this link to verify your email <a href="http://localhost:${PORT}/api/users/verify-email/${verificationToken}">http://localhost:${PORT}/api/users/verify-email/${verificationToken}</a></p>`;
              transporter.sendMail(
                {
                  to: logInUser.email,
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
                      error: `We have sent verification email to ${logInUser.email},Check your mailbox and verify your email`
                    });
                  }
                }
              );
            }
          } else {
            res
              .status(400)
              .json({ success: false, error: "Invalid log in credentials2" });
          }
        } else {
          res
            .status(400)
            .json({ success: false, error: "Invalid log in credentials1" });
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
router.get(
  "/verify-email/:verificationToken",
  param("verificationToken").isJWT(),
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        const verificationToken = req.params.verificationToken;
        JWT.verify(verificationToken, JWT_SECRET, async (error, response) => {
          if (error) {
            res.status(403).json({
              status: false,
              error: "Token is not valid!"
            });
          } else {
            const userId = response.id;
            const user = await User.findById(userId).select("-password");
            if (user) {
              if (user.emailVerified) {
                res
                  .status(400)
                  .json({ success: false, error: "Email already verified" });
              } else {
                await User.findByIdAndUpdate(userId, {
                  emailVerified: true
                }).select("-password");
                res.status(200).json({
                  success: true,
                  msg: "Email Verified Successfully,Now you can login into your account"
                });
              }
            } else {
              res
                .status(403)
                .json({ success: false, error: "Token is Tempered" });
            }
          }
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
);
export default router;
