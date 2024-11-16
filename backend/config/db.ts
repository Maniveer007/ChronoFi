import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(String(process.env.MONGO_DB));
    console.log("connected to db");
  } catch (error) {
    console.log(error);
  }
};
