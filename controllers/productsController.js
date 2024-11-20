import Product from "../models/products.js";
import ProductImage from "../models/images.js";
import { validationResult } from "express-validator";
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    if (products.length > 0) {
      const allProducts = await Promise.all(
        products.map(async (product) => {
          const productImage = await ProductImage.find({
            product: product.id
          });
          return {
            ...product._doc,
            images: productImage
          };
        })
      );
      res.status(200).json({ success: true, products: allProducts });
    } else {
      res.status(200).json({ success: true, products: [] });
    }
  } catch {
    res
      .status(500)
      .json({ success: false, msg: "Some Error on Server Occurred!" });
  }
};
const addNewProduct = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const staffMemberId = req.staffId;
      let newProduct = req.body;
      newProduct.productCreator = staffMemberId;
      Product.create(newProduct)
        .then(() => {
          res.status(200).json({
            success: true,
            msg: "Added new product"
          });
        })
        .catch((error) => {
          res.status(400).json({ success: false, error: error.message });
        });
    } else {
      res.status(400).json({
        success: false,
        error: result.errors
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
};
const getSingleProduct = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const productId = req.params.productId;
      const product = await Product.findById(productId);
      if (product) {
        const productImages = await ProductImage.find({ product: productId });
        if (productImages.length > 0) {
          res.status(200).json({
            success: true,
            product: { ...product._doc, images: productImages }
          });
        } else {
          res.status(200).json({ success: true, product: product });
        }
      } else {
        res
          .status(400)
          .json({ success: false, error: "Product with that id not found" });
      }
    } else {
      res.status(400).json({ success: false, error: result.errors });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
};
const deleteSingleProduct = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const productId = req.params.productId;
      const product = await Product.findById(productId);
      if (product) {
        const productImages = await ProductImage.find({ product: productId });
        if (productImages.length > 0) {
          await ProductImage.deleteMany({ product: productId });
          await Product.findByIdAndDelete(productId);
          res
            .status(200)
            .json({ success: true, msg: "Product deleted successfully" });
        } else {
          await Product.findByIdAndDelete(productId);
          res
            .status(200)
            .json({ success: true, msg: "Product deleted successfully" });
        }
      } else {
        res
          .status(400)
          .json({ success: false, error: "Product with that id not found" });
      }
    } else {
      res.status(400).json({ success: false, error: result.errors });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
};
const updateExistingProduct = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const productId = req.params.productId;
      const product = await Product.findById(productId);
      if (product) {
        const updatedFields = req.body;
        await Product.findByIdAndUpdate(productId, updatedFields);
        res
          .status(200)
          .json({ success: true, msg: "Product updated successfully" });
      } else {
        res.status(400).json({
          success: false,
          error: "Product with that id is not found"
        });
      }
    } else {
      res.status(400).json({ success: false, error: result.errors });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
};
const productsController = {
  getAllProducts: getAllProducts,
  addNewProduct: addNewProduct,
  getSingleProduct: getSingleProduct,
  deleteSingleProduct: deleteSingleProduct,
  updateExistingProduct: updateExistingProduct
};
export default productsController;
