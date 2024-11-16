import mongoose from "mongoose";

const subscriptionsSchema = new mongoose.Schema({
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
    required: false,
  },
  amountinUSD: {
    type: Number,
    required: true,
  },
  paymentToken: {
    type: String,
    required: true,
  },
});

// Create a compound index on address and subscriptionId
subscriptionsSchema.index({ address: 1, subscriptionId: 1 }, { unique: true });

export const Subscriptions = mongoose.model(
  "subscriptions",
  subscriptionsSchema
);
