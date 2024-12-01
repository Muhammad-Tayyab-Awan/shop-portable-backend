import express from "express";
import multer from "multer";
import verifyUserLogin from "../middlewares/verifyUserLogin.js";
import userProfileImageController from "../controllers/userProfileImageController.js";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();
router
  .route("/")
  .get(verifyUserLogin, userProfileImageController.getLoggedInUserProfileImage)
  .post(
    verifyUserLogin,
    upload.single("userProfileImage"),
    userProfileImageController.uploadLoggedInUserProfileImage
  )
  .put(
    verifyUserLogin,
    upload.single("userProfileImage"),
    userProfileImageController.updateLoggedInUserProfileImage
  )
  .delete(
    verifyUserLogin,
    userProfileImageController.deleteLoggedInUserProfileImage
  );
export default router;
