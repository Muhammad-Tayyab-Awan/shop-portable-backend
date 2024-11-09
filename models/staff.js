import mongoose, { Schema } from "mongoose";
const staffSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  emailVerified: {
    type: Boolean,
    required: true,
    default: false
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "deliveryMan", "productsManager"]
  },
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female"]
  },
  dob: {
    type: Date,
    required: true
  },
  joinedOn: {
    type: Date,
    required: true,
    default: Date.now
  },
  homeAddress: {
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
      required: true
    }
  }
});
const Staff = mongoose.model("staff", staffSchema);
export default Staff;
