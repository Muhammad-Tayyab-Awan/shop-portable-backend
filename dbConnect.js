import mongoose from "mongoose";
const DB_URL = process.env.DB_URL;

async function connect() {
  await mongoose.connect(DB_URL);
}

async function connectToDatabase() {
  await connect();
  return { success: "true", msg: "Connected to Database" };
}

export default connectToDatabase;
