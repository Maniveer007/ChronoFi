import { Request, Response } from "express";

import { LatestBlock } from "../model/LatestBlock";

export const getLatestBlock = async (req: Request, res: Response) => {
  try {
    const latestBlock = await LatestBlock.find();
    res.status(200).json(latestBlock[0]);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateLatestBlock = async (req: Request, res: Response) => {
  const { latestBlock } = req.body;

  try {
    const latestblock = await LatestBlock.findOne();
    console.log(latestblock);

    if (!latestblock) {
      console.log("NULL");

      const newLatestBlock = new LatestBlock({
        LatestBlock: Number(latestBlock),
      });
      await newLatestBlock.save();
      res.status(200).json(newLatestBlock);
      return;
    }
    latestblock.LatestBlock = Number(latestBlock);
    await latestblock.save();
    res.status(200).json(latestBlock);
  } catch (error) {
    console.log(error);

    res.status(500).json({ error: "Internal server error" });
  }
};
