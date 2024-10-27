import express from "express";
const router = express.Router();
import Product from "../models/products.js";
router.get("/", async (req, res) => {
  const result = await Product.find();
  res.json(result);
});

export default router;
