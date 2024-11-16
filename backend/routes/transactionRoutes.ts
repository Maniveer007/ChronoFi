import { Router } from "express";

import {
  getTransactions,
  getTransactionsByAddress,
  getTransactionBySubscriptionId,
  createTransaction,
} from "../controllers/transactionController";

export const transactionRoutes = Router();

transactionRoutes.get("/get-transactions", getTransactions);
transactionRoutes.post(
  "/get-transactions-by-address",
  getTransactionsByAddress
);
transactionRoutes.get(
  "/get-transaction-by-subscription-id",
  getTransactionBySubscriptionId
);
transactionRoutes.post("/create-transaction", createTransaction);
