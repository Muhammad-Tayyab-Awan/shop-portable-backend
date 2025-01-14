import mongoose, { Schema } from "mongoose";
const addressSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  country: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  postalCode: {
    type: Number,
    required: true
  },
  fullAddress: {
    type: String,
    required: true,
    unique: true
  },
  isDefault: {
    type: Boolean,
    required: true
  },
  addedOn: {
    type: Date,
    default: Date.now
  }
});
const Address = mongoose.model("address", addressSchema);
export default Address;
