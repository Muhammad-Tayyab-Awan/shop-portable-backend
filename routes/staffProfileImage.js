import express from "express";
import multer from "multer";
import verifyAdminLogin from "../middlewares/verifyAdminLogin.js";
import verifyLogin from "../middlewares/verifyLogin.js";
import { param } from "express-validator";
import staffProfileImageController from "../controllers/staffProfileImageController.js";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const router = express.Router();
router
  .route("/")
  .get(verifyLogin, staffProfileImageController.getLoggedInMemberProfileImage)
  .post(
    verifyLogin,
    upload.single("staffProfileImage"),
    staffProfileImageController.uploadLoggedInMemberProfileImage
  )
  .put(
    verifyLogin,
    upload.single("staffProfileImage"),
    staffProfileImageController.updateLoggedInMemberProfileImage
  )
  .delete(
    verifyLogin,
    staffProfileImageController.deleteLoggedInMemberProfileImage
  );
router
  .route("/:memberId")
  .post(
    verifyAdminLogin,
    param("memberId").isMongoId(),
    upload.single("staffProfileImage"),
    staffProfileImageController.uploadProfileImageStMemberByAdmin
  )
  .get(
    verifyAdminLogin,
    param("memberId").isMongoId(),
    staffProfileImageController.getStMemberProfileImageByAdmin
  )
  .put(
    verifyAdminLogin,
    param("memberId").isMongoId(),
    upload.single("staffProfileImage"),
    staffProfileImageController.updateStMemberProfileImageByAdmin
  )
  .delete(
    verifyAdminLogin,
    param("memberId").isMongoId(),
    staffProfileImageController.deleteStMemberProfileImageByAdmin
  );
export default router;
