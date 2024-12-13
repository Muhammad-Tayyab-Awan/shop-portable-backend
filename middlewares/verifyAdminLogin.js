import JWT from "jsonwebtoken";
import Staff from "../models/staff.js";
const JWT_SECRET = process.env.JWT_SECRET;
async function verifyAdminLogin(req, res, next) {
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
        const staffMember = await Staff.findById(response.id);
        if (staffMember) {
          if (
            staffMember.role === "admin" &&
            staffMember.emailVerified === true
          ) {
            req.staffId = response.id;
            next();
          } else {
            req
              .status(401)
              .json({ success: false, error: "Access Denied by Server" });
          }
        } else {
          res.status(400).json({ success: false, error: "Token is Tempered" });
        }
      }
    });
  }
}
export default verifyAdminLogin;
