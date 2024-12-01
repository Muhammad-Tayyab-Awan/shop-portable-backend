import UserProfileImage from "../models/profileImages.js";
const getLoggedInUserProfileImage = async (req, res) => {
  try {
    const userId = req.userId;
    const userProfileImage = await UserProfileImage.findOne({
      user: userId
    });
    if (userProfileImage) {
      res.contentType(userProfileImage.contentType);
      res.send(userProfileImage.image);
    } else {
      res.status(400).json({
        success: false,
        error: "No image found for current user"
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
const uploadLoggedInUserProfileImage = async (req, res) => {
  try {
    const userId = req.userId;
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
        const usProfileImage = await UserProfileImage.findOne({
          user: userId
        });
        if (usProfileImage) {
          res.status(400).json({
            success: false,
            msg: "Profile image already exists"
          });
        } else {
          UserProfileImage.create({
            user: userId,
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
};
const updateLoggedInUserProfileImage = async (req, res) => {
  try {
    const userId = req.userId;
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
        const usProfileImage = await UserProfileImage.findOne({
          user: userId
        });
        if (usProfileImage) {
          usProfileImage.image = req.file.buffer;
          await usProfileImage.save();
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
};
const deleteLoggedInUserProfileImage = async (req, res) => {
  try {
    const userId = req.userId;
    const usProfileImage = await UserProfileImage.findOne({
      user: userId
    });
    if (usProfileImage) {
      await UserProfileImage.findOneAndDelete({
        user: userId
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
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
};
const userProfileImageController = {
  getLoggedInUserProfileImage: getLoggedInUserProfileImage,
  uploadLoggedInUserProfileImage: uploadLoggedInUserProfileImage,
  updateLoggedInUserProfileImage: updateLoggedInUserProfileImage,
  deleteLoggedInUserProfileImage: deleteLoggedInUserProfileImage
};
export default userProfileImageController;
