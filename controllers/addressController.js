import Address from "../models/addresses.js";
import { validationResult } from "express-validator";

const addNewAddress = async function (req, res) {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const userId = req.userId;
      let newAddress = req.body;
      newAddress.user = userId;
      if (newAddress.isDefault) {
        const defaultAddress = await Address.findOne({
          isDefault: true,
          user: userId
        });
        if (defaultAddress) {
          res.status(400).json({
            success: false,
            error: "A Default Address already exists"
          });
        } else {
          Address.create(newAddress)
            .then(() => {
              res.status(200).json({
                success: true,
                msg: "New Address created successfully"
              });
            })
            .catch((err) => {
              res.status(400).json({ success: false, error: err.message });
            });
        }
      } else {
        Address.create(newAddress)
          .then(() => {
            res.status(200).json({
              success: true,
              msg: "New Address created successfully"
            });
          })
          .catch((err) => {
            res.status(400).json({ success: false, error: err.message });
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
const getDefaultAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const defaultAddress = await Address.findOne({
      user: userId,
      isDefault: true
    });
    if (defaultAddress) {
      res.status(200).json({ success: true, defaultAddress: defaultAddress });
    } else {
      res
        .status(400)
        .json({ success: false, error: "No default address found" });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error Occurred on Server Side",
      message: error.message
    });
  }
};
const deleteDefaultAddress = async (req, res) => {
  try {
    const userId = req.userId;
    const defaultAddress = await Address.findOne({
      user: userId,
      isDefault: true
    });
    if (defaultAddress) {
      await Address.findOneAndDelete({ user: userId, isDefault: true });
      res.status(200).json({
        success: true,
        msg: "User's default address deleted successfully"
      });
    } else {
      res.status(400).json({
        success: false,
        error: "No default address present for current user"
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
const getAllAddresses = async (req, res) => {
  try {
    const userId = req.userId;
    const allAddresses = await Address.find({ user: userId });
    if (allAddresses.length > 0) {
      res.status(200).json({ success: true, allAddresses: allAddresses });
    } else {
      res.status(400).json({
        success: false,
        error: "No addresses found for current user"
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
const deleteAllAddresses = async (req, res) => {
  try {
    const userId = req.userId;
    const allAddresses = await Address.find({ user: userId });
    if (allAddresses.length > 0) {
      await Address.deleteMany({ user: userId });
      res.status(200).json({
        success: true,
        msg: "Deleted all addresses of current user"
      });
    } else {
      res.status(400).json({
        success: false,
        error: "No addresses found for current user"
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
const getParticularAddress = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const userId = req.userId;
      const addressId = req.params.addressId;
      const address = await Address.findById(addressId);
      if (address && address.user.toString() === userId) {
        res.status(200).json({ success: true, address: address });
      } else {
        res
          .status(400)
          .json({ success: false, error: "No address found with that id" });
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
const deleteParticularAddress = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const userId = req.userId;
      const addressId = req.params.addressId;
      const address = await Address.findById(addressId);
      if (address && address.user.toString() === userId) {
        await Address.findByIdAndDelete(addressId);
        res
          .status(200)
          .json({ success: true, msg: "Address deleted successfully" });
      } else {
        res
          .status(400)
          .json({ success: false, error: "No address found with that id" });
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
const updateParticularAddress = async (req, res) => {
  try {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const userId = req.userId;
      const addressId = req.params.addressId;
      const address = await Address.findById(addressId);
      if (address && address.user.toString() === userId) {
        const updatedAddress = req.body;
        if (updatedAddress.isDefault && address.isDefault) {
          res.status(400).json({
            success: true,
            error: "Default address already exists"
          });
        } else {
          await Address.findByIdAndUpdate(addressId, updatedAddress);
          res.status(200).json({
            success: true,
            msg: "User address updated successfully"
          });
        }
      } else {
        res
          .status(400)
          .json({ success: false, error: "No address found with that id" });
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
const addressController = {
  addNewAddress: addNewAddress,
  getDefaultAddress: getDefaultAddress,
  deleteDefaultAddress: deleteDefaultAddress,
  getAllAddresses: getAllAddresses,
  deleteAllAddresses: deleteAllAddresses,
  getParticularAddress: getParticularAddress,
  deleteParticularAddress: deleteParticularAddress,
  updateParticularAddress: updateParticularAddress
};
export default addressController;
