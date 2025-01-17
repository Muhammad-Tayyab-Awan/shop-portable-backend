import JWT from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;
async function verifyLogin(req, res, next) {
  let token = req.header("auth-token") || req.cookies["auth-token"];
  if (!token) {
    res
      .status(401)
      .json({ success: false, error: "Access denied from server!" });
  } else {
    JWT.verify(token, JWT_SECRET, (err, response) => {
      if (err) {
        res.status(403).json({
          status: false,
          error: "Token is not valid!"
        });
      } else {
        req.staffId = response.id;
        next();
      }
    });
  }
}
export default verifyLogin;
