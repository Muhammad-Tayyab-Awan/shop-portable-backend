import JWT from "jsonwebtoken";
import User from "../models/users.js";
const JWT_SECRET = process.env.JWT_SECRET;
async function verifyUserLogin(req, res, next) {
  let token = req.header("auth-token") || req.cookies["auth-token"];
  if (!token) {
    res
      .status(401)
      .json({ success: false, error: "Access denied from server!" });
  } else {
    JWT.verify(token, JWT_SECRET, async (err, response) => {
      if (err) {
        res.status(403).json({
          status: false,
          error: "Token is not valid!"
        });
      } else {
        const user = await User.findById(response.id);
        if (user && user.emailVerified === true) {
          req.userId = response.id;
          next();
        } else {
          res.status(400).json({ success: false, error: "Token is Tempered" });
        }
      }
    });
  }
}
export default verifyUserLogin;
