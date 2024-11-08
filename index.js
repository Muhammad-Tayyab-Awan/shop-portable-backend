import express from "express";
import cors from "cors";
import "dotenv/config";
import bodyParser from "body-parser";
import connectToDatabase from "./dbConnect.js";
import productRoute from "./routes/products.js";
import staffRoute from "./routes/staff.js";
const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use("/api/products", productRoute);
app.use("/api/staff", staffRoute);
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
app.listen(PORT, (err) => {
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
    msg: `App running on http://localhost:${PORT}}`
  });
});
