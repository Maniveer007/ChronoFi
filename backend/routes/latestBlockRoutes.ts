import { Router } from "express";

import {
  getLatestBlock,
  updateLatestBlock,
} from "../controllers/latestBlockController";

export const latestBlockRoutes = Router();

latestBlockRoutes.get("/get-latest-block", getLatestBlock);
latestBlockRoutes.post("/update-latest-block", updateLatestBlock);
