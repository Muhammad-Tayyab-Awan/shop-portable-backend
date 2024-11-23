import express from "express";
import verifyUserLogin from "../middlewares/verifyUserLogin.js";
import verifyAdminLogin from "../middlewares/verifyAdminLogin.js";
import { body, param } from "express-validator";
import userController from "../controllers/userController.js";
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
    userController.createUserAccount
  )
  .get(verifyUserLogin, userController.getLoggedInUserData)
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
    userController.updateLoggedInUserData
  )
  .delete(verifyUserLogin, userController.deleteRequestLoggedInUser);
router.get(
  "/confirm-delete/:deletionToken",
  param("deletionToken").isJWT(),
  userController.confirmAccountDeletion
);

router.get(
  "/cancel-delete/:deletionToken",
  param("deletionToken"),
  userController.cancelAccountDeletion
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
  userController.logInUser
);
router.get(
  "/verify-email/:verificationToken",
  param("verificationToken").isJWT(),
  userController.verifyUserEmail
);
router.get("/all-users", verifyAdminLogin, userController.getAllUsersData);
router
  .route("/all-users/:userId")
  .get(
    verifyAdminLogin,
    param("userId").isMongoId(),
    userController.getParticularUserData
  )
  .put(
    verifyAdminLogin,
    param("userId").isMongoId(),
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
    userController.updateParticularUserData
  )
  .delete(
    verifyAdminLogin,
    param("userId"),
    userController.deleteParticularUserData
  );
router.post(
  "/add-user",
  verifyAdminLogin,
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
  userController.addNewUserAccount
);
export default router;
