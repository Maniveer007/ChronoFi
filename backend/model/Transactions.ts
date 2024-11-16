import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  subscriptionId: {
    type: Number,
    required: true,
  },
  nameofSubscription: {
    type: String,
    required: true,
  },
  amountinTokens: {
    type: Number,
    required: true,
  },
  paymentToken: {
    type: String,
    required: true,
  },
  transactionNumber: {
    type: Number,
    required: true,
  },
  transactionUrl: {
    type: String,
    required: true,
  },
  transationAt: {
    type: Date,
    default: Date.now,
  },
});

export const Transactions = mongoose.model("Transaction", transactionSchema);
