import { validationResult } from "express-validator";
import Staff from "../models/staff.js";
import StaffProfileImage from "../models/staffProfileImages.js";
const getLoggedInMemberProfileImage = async (req, res) => {
  try {
    const staffMemberId = req.staffId;
    const staffMember = await Staff.findById(staffMemberId);
    if (staffMember) {
      const staffProfileImage = await StaffProfileImage.findOne({
        staffMember: staffMemberId
      });
      if (staffProfileImage) {
        res.contentType(staffProfileImage.contentType);
        res.send(staffProfileImage.image);
      } else {
        res.status(400).json({
          success: false,
          error: "No image found for current user"
        });
      }
    } else {
      res.status(400).json({
        success: false,
        error: "Token is Tempered"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
};
const uploadLoggedInMemberProfileImage = async (req, res) => {
  try {
    const staffMemberId = req.staffId;
    const staffMember = await Staff.findById(staffMemberId);
    if (staffMember) {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: "No image file uploaded please upload an image file"
        });
      } else {
        if (req.file.mimetype !== "image/png") {
          res.status(400).json({
            success: false,
            error: "We only accept image in png format"
          });
        } else {
          const stProfileImage = await StaffProfileImage.findOne({
            staffMember: staffMemberId
          });
          if (stProfileImage) {
            res.status(400).json({
              success: false,
              msg: "Profile image already exists"
            });
          } else {
            StaffProfileImage.create({
              staffMember: staffMemberId,
              image: req.file.buffer
            }).then(() => {
              res.status(200).json({
                success: true,
                msg: "Profile image uploaded successfully"
              });
            });
          }
        }
      }
    } else {
      res.status(400).json({ success: false, error: "Token is Tempered" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
};
const updateLoggedInMemberProfileImage = async (req, res) => {
  try {
    const staffMemberId = req.staffId;
    const staffMember = await Staff.findById(staffMemberId);
    if (staffMember) {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: "No image file uploaded please upload an image file"
        });
      } else {
        if (req.file.mimetype !== "image/png") {
          res.status(400).json({
            success: false,
            error: "We only accept image in png format"
          });
        } else {
          const stProfileImage = await StaffProfileImage.findOne({
            staffMember: staffMemberId
          });
          if (stProfileImage) {
            stProfileImage.image = req.file.buffer;
            await stProfileImage.save();
            res.status(200).json({
              success: true,
              msg: "Profile image updated successfully"
            });
          } else {
            res.status(400).json({
              success: false,
              error: "No image found for current user"
            });
          }
        }
      }
    } else {
      res.status(400).json({
        success: false,
        error: "Token is Tempered"
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
};
const deleteLoggedInMemberProfileImage = async (req, res) => {
  try {
    const staffMemberId = req.staffId;
    const staffMember = await Staff.findById(staffMemberId);
    if (staffMember) {
      const stProfileImage = await StaffProfileImage.findOne({
        staffMember: staffMemberId
      });
      if (stProfileImage) {
        await StaffProfileImage.findOneAndDelete({
          staffMember: staffMemberId
        });
        res.status(200).json({
          success: false,
          msg: "Profile image deleted successfully"
        });
      } else {
        res.status(400).json({
          success: false,
          error: "No image found for current user"
        });
      }
    } else {
      res.status(400).json({ success: false, error: "Token is Tempered" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
};
const uploadProfileImageStMemberByAdmin = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const staffMember = await Staff.findById(req.params.memberId);
      if (staffMember) {
        if (!req.file) {
          res.status(400).json({
            success: false,
            error: "No image file uploaded please upload an image file"
          });
        } else {
          if (req.file.mimetype !== "image/png") {
            res.status(400).json({
              success: false,
              error: "We only accept image in png format"
            });
          } else {
            const stProfileImage = await StaffProfileImage.findOne({
              staffMember: staffMember.id
            });
            if (stProfileImage) {
              res.status(400).json({
                success: false,
                msg: "Profile image already exists"
              });
            } else {
              StaffProfileImage.create({
                staffMember: staffMember.id,
                image: req.file.buffer
              }).then(() => {
                res.status(200).json({
                  success: true,
                  msg: "Profile image uploaded successfully"
                });
              });
            }
          }
        }
      } else {
        res.status(400).json({
          success: false,
          error: "No staff member found with given id"
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
};
const getStMemberProfileImageByAdmin = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const staffMember = await Staff.findById(req.params.memberId);
      if (staffMember) {
        const staffProfileImage = await StaffProfileImage.findOne({
          staffMember: staffMember.id
        });
        if (staffProfileImage) {
          res.contentType(staffProfileImage.contentType);
          res.send(staffProfileImage.image);
        } else {
          res.status(400).json({
            success: false,
            error: "No image found for current user"
          });
        }
      } else {
        res.status(400).json({
          success: false,
          error: "No staff member found with given id"
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
};
const updateStMemberProfileImageByAdmin = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const staffMember = await Staff.findById(req.params.memberId);
      if (staffMember) {
        if (!req.file) {
          res.status(400).json({
            success: false,
            error: "No image file uploaded please upload an image file"
          });
        } else {
          if (req.file.mimetype !== "image/png") {
            res.status(400).json({
              success: false,
              error: "We only accept image in png format"
            });
          } else {
            const stProfileImage = await StaffProfileImage.findOne({
              staffMember: staffMember.id
            });
            if (stProfileImage) {
              stProfileImage.image = req.file.buffer;
              await stProfileImage.save();
              res.status(200).json({
                success: true,
                msg: "Profile image updated successfully"
              });
            } else {
              res.status(400).json({
                success: false,
                error: "No image found for current user"
              });
            }
          }
        }
      } else {
        res.status(400).json({
          success: false,
          error: "No staff member found with given id"
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
};
const deleteStMemberProfileImageByAdmin = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const staffMember = await Staff.findById(req.params.memberId);
      if (staffMember) {
        const stProfileImage = await StaffProfileImage.findOne({
          staffMember: staffMember.id
        });
        if (stProfileImage) {
          await StaffProfileImage.findOneAndDelete({
            staffMember: staffMember.id
          });
          res.status(200).json({
            success: false,
            msg: "Profile image deleted successfully"
          });
        } else {
          res.status(400).json({
            success: false,
            error: "No image found for current user"
          });
        }
      } else {
        res.status(400).json({
          success: false,
          error: "No staff member found with given id"
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
};
const staffProfileImageController = {
  getLoggedInMemberProfileImage: getLoggedInMemberProfileImage,
  uploadLoggedInMemberProfileImage: uploadLoggedInMemberProfileImage,
  updateLoggedInMemberProfileImage: updateLoggedInMemberProfileImage,
  deleteLoggedInMemberProfileImage: deleteLoggedInMemberProfileImage,
  uploadProfileImageStMemberByAdmin: uploadProfileImageStMemberByAdmin,
  getStMemberProfileImageByAdmin: getStMemberProfileImageByAdmin,
  updateStMemberProfileImageByAdmin: updateStMemberProfileImageByAdmin,
  deleteStMemberProfileImageByAdmin: deleteStMemberProfileImageByAdmin
};
export default staffProfileImageController;
