import { Request, Response } from "express";

import { Subscriptions } from "../model/Subscriptions";

export const getSubscriptions = async (req: Request, res: Response) => {
  try {
    const subscriptions = await Subscriptions.find();
    res.status(200).json(subscriptions);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const createSubscription = async (req: Request, res: Response) => {
  const {
    address,
    subscriptionId,
    nameofSubscription,
    amountinUSD,
    paymentToken,
  } = req.body;

  try {
    const subscription = new Subscriptions({
      address,
      subscriptionId,
      nameofSubscription,
      amountinUSD,
      paymentToken,
    });
    await subscription.save();
    res.status(200).json(subscription);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Internal server error" });
  }
};
