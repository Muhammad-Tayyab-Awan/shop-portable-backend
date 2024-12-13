import User from "../models/users.js";
import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
const PORT = process.env.PORT || 3000;
import transporter from "../mailTransporter.js";
import { validationResult } from "express-validator";
const createUserAccount = async (req, res) => {
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
};
const getLoggedInUserData = async (req, res) => {
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
};
const updateLoggedInUserData = async (req, res) => {
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
};
const deleteRequestLoggedInUser = async (req, res) => {
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
};
const confirmAccountDeletion = async (req, res) => {
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
};
const cancelAccountDeletion = async (req, res) => {
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
};
const logInUser = async (req, res) => {
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
                  res.status(400).json({
                    success: false,
                    error: `We have sent verification email to ${logInUser.email},Check your mailbox and verify your email`
                  });
                }
              }
            );
          }
        } else {
          res
            .status(400)
            .json({ success: false, error: "Invalid log in credentials" });
        }
      } else {
        res
          .status(400)
          .json({ success: false, error: "Invalid log in credentials" });
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
};
const verifyUserEmail = async (req, res) => {
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
};
const getAllUsersData = async (req, res) => {
  try {
    const allUsers = await User.find().select("-password");
    if (allUsers.length > 0) {
      res.status(200).json({ success: true, allUsers: allUsers });
    } else {
      res.status(200).json({ success: true, allUsers: 0 });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
};
const getParticularUserData = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const userId = req.params.userId;
      const user = await User.findById(userId).select("-password");
      if (user) {
        res.status(200).json({ success: true, userData: user });
      } else {
        res
          .status(400)
          .json({ success: false, error: "No user found with that id" });
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
};
const updateParticularUserData = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (user) {
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
              msg: `${user.username}'s data is updated successfully`
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
          .json({ success: false, error: "No user found with that id" });
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
};
const deleteParticularUserData = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const userId = req.params.userId;
      const user = await User.findById(userId).select("-password");
      if (user) {
        await User.findByIdAndDelete(userId);
        res
          .status(200)
          .json({ success: true, msg: "User account deleted successfully" });
      } else {
        res
          .status(400)
          .json({ success: true, error: "No user found with that id" });
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
};
const addNewUserAccount = async (req, res) => {
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
            msg: "New user account created successfully"
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
};
const userController = {
  createUserAccount: createUserAccount,
  getLoggedInUserData: getLoggedInUserData,
  updateLoggedInUserData: updateLoggedInUserData,
  deleteRequestLoggedInUser: deleteRequestLoggedInUser,
  confirmAccountDeletion: confirmAccountDeletion,
  cancelAccountDeletion: cancelAccountDeletion,
  logInUser: logInUser,
  verifyUserEmail: verifyUserEmail,
  getAllUsersData: getAllUsersData,
  getParticularUserData: getParticularUserData,
  updateParticularUserData: updateParticularUserData,
  deleteParticularUserData: deleteParticularUserData,
  addNewUserAccount: addNewUserAccount
};
export default userController;
