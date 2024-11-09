import mongoose, { Schema } from "mongoose";
const usersSchema = new Schema({
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
  gender: {
    type: String,
    required: true,
    enum: ["Male", "Female"]
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
  password: {
    type: String,
    required: true
  },
  dob: {
    type: Date,
    required: true
  },
  joinedOn: {
    type: Date,
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
const User = mongoose.model("user", usersSchema);
export default User;
