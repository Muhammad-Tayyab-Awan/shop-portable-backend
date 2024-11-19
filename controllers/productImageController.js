import ProductImage from "../models/images.js";
import Product from "../models/products.js";
import { validationResult } from "express-validator";
const getAllProdImagesAdPM = async (req, res) => {
  try {
    const allProductsImages = await ProductImage.find();
    res
      .status(200)
      .json({ success: true, allProductsImages: allProductsImages });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
};
const getProdImageAdPM = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const productId = req.params.productId;
      const product = await Product.findById(productId);
      if (product) {
        const productImages = await ProductImage.find({ product: productId });
        if (productImages.length === 0) {
          res.status(400).json({
            success: false,
            error: "No images found for that product"
          });
        } else {
          res.status(200).json({ success: true, images: productImages });
        }
      } else {
        res
          .status(400)
          .json({ success: false, error: "No product found with that id" });
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
const uploadProdImageAdPM = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const productId = req.params.productId;
      const product = await Product.findById(productId);
      if (product) {
        if (!req.file) {
          res.status(400).json({
            success: false,
            error: "No image file uploaded please upload an image file"
          });
        } else {
          if (req.file.mimetype !== "image/png") {
            res.status(400).json({
              success: false,
              error: "We only accept image in png format"
            });
          } else {
            ProductImage.create({
              product: productId,
              image: req.file.buffer
            })
              .then(() => {
                res.status(200).json({
                  success: true,
                  msg: "Product image uploaded successfully"
                });
              })
              .catch((err) => {
                res.status(400).json({
                  success: false,
                  error: err.message
                });
              });
          }
        }
      } else {
        res
          .status(400)
          .json({ success: false, error: "No product found with that id" });
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
const deleteProdImagesAdPM = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const productId = req.params.productId;
      const product = await Product.findById(productId);
      if (product) {
        const productImages = await ProductImage.find({ product: productId });
        if (productImages.length > 0) {
          await ProductImage.deleteMany({ product: productId });
          res.status(200).json({
            success: true,
            msg: "Product images deleted successfully"
          });
        } else {
          res.status(400).json({
            success: false,
            error: "No images found for that product"
          });
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
const getProdImageByIdAdPM = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const imageId = req.params.imageId;
      const image = await ProductImage.findById(imageId);
      if (image) {
        res.status(200).json({ success: true, image: image });
      } else {
        res
          .status(400)
          .json({ success: false, error: "No image found with this id" });
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
const deleteProdImageById = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const imageId = req.params.imageId;
      const image = await ProductImage.findById(imageId);
      if (image) {
        await ProductImage.findByIdAndDelete(imageId);
        res.status(200).json({
          success: true,
          msg: "Product image deleted successfully"
        });
      } else {
        res
          .status(400)
          .json({ success: false, error: "No image found with this id" });
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
const productImageController = {
  getAllProdImagesAdPM: getAllProdImagesAdPM,
  getProdImageAdPM: getProdImageAdPM,
  uploadProdImageAdPM: uploadProdImageAdPM,
  deleteProdImagesAdPM: deleteProdImagesAdPM,
  getProdImageByIdAdPM: getProdImageByIdAdPM,
  deleteProdImageById: deleteProdImageById
};
export default productImageController;
