import express from "express";
import "dotenv/config";
import connectToDatabase from "./dbConnect.js";
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send({ success: "true", msg: "Welcome to ShopPortable.com" });
});

app.listen(PORT, (err) => {
  connectToDatabase()
    .then((res) => {
      console.log(res);
    })
    .catch(() => {
      console.log({ success: "false", msg: "Connection Error Occurred" });
    });
  console.log(`App is running on http://localhost:${PORT}`);
});
