import { Request, Response } from "express";

import { Transactions } from "../model/Transactions";

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const transactions = await Transactions.find();
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getTransactionsByAddress = async (req: Request, res: Response) => {
  const { address } = req.body;

  try {
    const transactions = await Transactions.find({ address });
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getTransactionBySubscriptionId = async (
  req: Request,
  res: Response
) => {
  const { address, subscriptionId } = req.body;
  try {
    const transaction = await Transactions.find({ address, subscriptionId });
    res.status(200).json(transaction);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  const {
    address,
    subscriptionId,
    amount,
    paymentToken,
    transactionUrl,
    nameofSubscription,
  } = req.body;

  try {
    const transactions = await Transactions.find({ address, subscriptionId });
    const transaction = new Transactions({
      address,
      subscriptionId,
      amountinTokens: amount,
      paymentToken,
      transactionUrl,
      transactionNumber: transactions.length + 1,
      nameofSubscription,
    });
    await transaction.save();
    res.status(200).json(transaction);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Internal server error" });
  }
};
