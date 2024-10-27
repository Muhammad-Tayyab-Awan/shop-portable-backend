import express from "express";
import "dotenv/config";
import bodyParser from "body-parser";
import connectToDatabase from "./dbConnect.js";
import productRoute from "./routes/products.js";
const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use("/api/products", productRoute);

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
    success: "true",
    msg: `App running on http://localhost:${PORT}}`
  });
});
