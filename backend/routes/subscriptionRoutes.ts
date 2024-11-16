import {
  createSubscription,
  getSubscriptions,
} from "../controllers/subscriptionControllers";
import { Router } from "express";

export const subscriptionRoutes = Router();

subscriptionRoutes.post("/create-subscription", createSubscription);
subscriptionRoutes.get("/get-subscriptions", getSubscriptions);
