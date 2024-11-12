import express from "express";
import { param, body } from "express-validator";
import verifyLogin from "../middlewares/verifyLogin.js";
import verifyAdminLogin from "../middlewares/verifyAdminLogin.js";
import staffController from "../controllers/staffController.js";
import bodyValidators from "../utils/bodyValidators.js";
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
  staffController.staffLogin
);
router.get(
  "/verify-email/:verificationToken",
  staffController.emailVerification
);
router.get("/getuser", verifyLogin, staffController.loggedInUserInfo);

router.put(
  "/updateuser",
  bodyValidators.updateLoggedInUserBodyValidations,
  verifyLogin,
  staffController.updateLoggedInUser
);

router.get(
  "/deleteuser",
  verifyLogin,
  staffController.deleteAccountRequestForLoggedInUser
);

router.delete(
  "/confirm-delete/:deletionToken",
  staffController.deleteAccountForLoggedInUser
);

router.get(
  "/cancel-delete/:deletionToken",
  staffController.cancelDeleteRequestForLoggedInUser
);

router.post(
  "/addmember",
  verifyAdminLogin,
  bodyValidators.addMemberBodyValidations,
  staffController.addStaffMember
);

router.get("/all-members", verifyAdminLogin, staffController.allMembersInfo);

router
  .route("/all-members/:memberId")
  .get(
    param("memberId").isMongoId(),
    verifyAdminLogin,
    staffController.particularMemberInfo
  )
  .put(
    verifyAdminLogin,
    param("memberId").isMongoId(),
    bodyValidators.updateMemberBodyValidations,
    staffController.updateParticularMember
  )
  .delete(
    verifyAdminLogin,
    param("memberId").isMongoId(),
    staffController.deleteParticularMember
  );
export default router;
