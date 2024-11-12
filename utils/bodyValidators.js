import { body } from "express-validator";
const updateLoggedInUserBodyValidations = [
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
const addMemberBodyValidations = [
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
const updateMemberBodyValidations = [
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
const bodyValidators = {
  updateLoggedInUserBodyValidations: updateLoggedInUserBodyValidations,
  addMemberBodyValidations: addMemberBodyValidations,
  updateMemberBodyValidations: updateMemberBodyValidations
};
export default bodyValidators;
