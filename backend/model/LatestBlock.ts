import mongoose from "mongoose";

const latestBlock = new mongoose.Schema({
  LatestBlock: {
    type: Number,
    required: true,
  },
});

export const LatestBlock = mongoose.model("LatestBlock", latestBlock);
