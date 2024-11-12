import express from "express";
import bcrypt from "bcryptjs";
import expressValidator, { param } from "express-validator";
const { body, validationResult } = expressValidator;
import JWT from "jsonwebtoken";
import Staff from "../models/staff.js";
import transporter from "../mailTransporter.js";
const PORT = process.env.PORT || 3000;
import User from "../models/users.js";
import Address from "../models/addresses.js";
import verifyLogin from "../middlewares/verifyLogin.js";
import verifyAdminLogin from "../middlewares/verifyAdminLogin.js";
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
      const deletionToken = JWT.sign({ id: staffMember.id }, JWT_SECRET);
      const htmlMessage = `<h1 style="text-align:center;width:100%">Account Deletion</h1><p style="text-align:center;width:100%">Dear ${staffMember.firstName}&nbsp;${staffMember.lastName}, Do You really want to delete your account permanently?</p><p style="text-align:center;"><a href="http://localhost:${PORT}/api/staff/confirm-delete/${deletionToken}" style="background-color:#f00;color:white;font-weight:bold;text-decoration:none;text-align:center;padding: 3px 10px;border-radius:5px;">Yes</a>&nbsp;&nbsp;<a href="http://localhost:${PORT}/api/staff/cancel-delete/${deletionToken}" style="background-color:#0f0;color:white;font-weight:bold;text-decoration:none;text-align:center;padding: 3px 10px;border-radius:5px;">No</a></p>`;
      transporter.sendMail(
        {
          to: staffMember.email,
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
              error: `We have sent account deletion confirmation email to ${staffMember.email},Check your mailbox`
            });
          }
        }
      );
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
router.delete("/confirm-delete/:deletionToken", async (req, res) => {
  try {
    const deletionToken = req.params.deletionToken;
    JWT.verify(deletionToken, JWT_SECRET, async (error, response) => {
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
          await Staff.findByIdAndDelete(staffMemberId).select("-password");
          res.status(200).json({
            success: true,
            msg: `Dear ${staffMember.firstName} ${staffMember.lastName}, Your account is successfully deleted`
          });
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
router.get("/cancel-delete/:deletionToken", async (req, res) => {
  try {
    const deletionToken = req.params.deletionToken;
    JWT.verify(deletionToken, JWT_SECRET, async (error, response) => {
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
          res.status(200).json({
            success: true,
            msg: `Dear ${staffMember.firstName} ${staffMember.lastName}, Your account deletion request cancelled successfully`
          });
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
const addMemberValidations = [
  body("username")
    .matches(/^(?=.*[a-z])(?=.*\d)[a-z\d]+$/)
    .isLength({ min: 6, max: 20 }),
  body("firstName").isAlpha().isLength({ min: 3, max: 24 }),
  body("lastName").isAlpha().isLength({ min: 3, max: 28 }),
  body("email").isEmail(),
  body("role").isAlpha().isIn(["admin", "deliveryMan", "productsManager"]),
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
  body("gender")
    .isAlpha()
    .isLength({ min: 4, max: 6 })
    .isIn(["Male", "Female"]),
  body("dob").isISO8601({ strict: true, strictSeparator: true }),
  body("country").isAlpha(),
  body("state").isAlpha(),
  body("city").isAlpha(),
  body("postalCode").isPostalCode("any"),
  body("fullAddress").isString().isLength({ min: 4 })
];
router.post(
  "/addmember",
  verifyAdminLogin,
  addMemberValidations,
  async (req, res) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const newMember = {
          username: req.body.username,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
          role: req.body.role,
          password: hashedPassword,
          gender: req.body.gender,
          dob: req.body.dob,
          homeAddress: {
            country: req.body.country,
            state: req.body.state,
            city: req.body.city,
            postalCode: req.body.postalCode,
            fullAddress: req.body.fullAddress
          }
        };
        Staff.create(newMember)
          .then(async () => {
            res
              .status(200)
              .json({ success: true, msg: "New Member added successfully" });
          })
          .catch((error) => {
            res.status(400).json({
              success: false,
              error: "Duplicate key error",
              msg: error.message
            });
          });
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
router.get("/all-members", verifyAdminLogin, async (req, res) => {
  try {
    const staffAdmin = await Staff.findById(req.staffId).select("-password");
    let allMembers = await Staff.find().select("-password");
    allMembers = allMembers.filter((member) => {
      return staffAdmin.username !== member.username;
    });
    res.status(200).json({
      success: true,
      members: { count: allMembers.length, membersData: allMembers }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
});
const updateMemberValidations = [
  body("username")
    .matches(/^(?=.*[a-z])(?=.*\d)[a-z\d]+$/)
    .isLength({ min: 6, max: 20 })
    .optional(),
  body("firstName").isAlpha().isLength({ min: 3, max: 24 }).optional(),
  body("lastName").isAlpha().isLength({ min: 3, max: 28 }).optional(),
  body("email").isEmail().optional(),
  body("role")
    .isAlpha()
    .isIn(["admin", "deliveryMan", "productsManager"])
    .optional(),
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
router
  .route("/all-members/:memberId")
  .get(param("memberId").isMongoId(), verifyAdminLogin, async (req, res) => {
    try {
      const result = validationResult(req);
      if (result.isEmpty()) {
        const staffMemberId = req.params.memberId;
        const staffMember = await Staff.findById(staffMemberId).select(
          "-password"
        );
        if (staffMember) {
          res.status(200).json({ success: true, memberData: staffMember });
        } else {
          res.status(400).json({ success: false, error: "No Member found" });
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
  .put(
    verifyAdminLogin,
    param("memberId").isMongoId(),
    updateMemberValidations,
    async (req, res) => {
      try {
        const result = validationResult(req);
        if (result.isEmpty()) {
          const staffMemberId = req.params.memberId;
          const staffMember = await Staff.findById(staffMemberId).select(
            "-password"
          );
          if (staffMember) {
            const {
              username,
              firstName,
              lastName,
              email,
              role,
              gender,
              dob,
              country,
              state,
              city,
              postalCode,
              fullAddress
            } = req.body;
            const updatedStaffMember = {
              username,
              firstName,
              lastName,
              email,
              role,
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
            Staff.findByIdAndUpdate(staffMemberId, updatedStaffMember, {
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
            res
              .status(400)
              .json({ success: false, error: "Token is Tempered" });
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
