import express from "express";
import cors from "cors";
import "dotenv/config";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import connectToDatabase from "./dbConnect.js";
import productRoute from "./routes/products.js";
import staffRoute from "./routes/staff.js";
import staffProfileImageRoute from "./routes/staffProfileImage.js";
import userProfileImageRoute from "./routes/userProfileImage.js";
import productsImagesRoute from "./routes/productImages.js";
import userRoute from "./routes/users.js";
import addressRoute from "./routes/address.js";
import ordersRoute from "./routes/order.js";
import deliverRoute from "./routes/deliver.js";
const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
  optionSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw());
app.use(bodyParser.text());
app.use("/api/products", productRoute);
app.use("/api/products-images", productsImagesRoute);
app.use("/api/staff", staffRoute);
app.use("/api/staff-profile-image", staffProfileImageRoute);
app.use("/api/user-profile-image", userProfileImageRoute);
app.use("/api/users", userRoute);
app.use("/api/address", addressRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/delivery-man", deliverRoute);
app.get("/", (req, res) => {
  res.send({
    success: true,
    msg: {
      1: "Welcome to ShopPortable.com",
      2: "Visit: https://github.com/Muhammad-Tayyab-Awan/shop-portable-backend/blob/main/README.md"
    }
  });
});
app.all("*", (req, res) => {
  res.status(404).json({ success: false, msg: `Requested Service Not Found` });
});
const server = app.listen(PORT, (err) => {
  console.clear();
  connectToDatabase()
    .then((res) => {
      console.log(res);
    })
    .catch(() => {
      console.log({ success: false, msg: "Connection Error Occurred" });
    });
  console.log({
    success: true,
    msg: `App running on http://localhost:${PORT}`
  });
});
