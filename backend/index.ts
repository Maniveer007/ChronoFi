import express, { Request, Response } from "express";
import { connectDB } from "./config/db";
import dotenv from "dotenv";
import { subscriptionRoutes } from "./routes/subscriptionRoutes";
import { transactionRoutes } from "./routes/transactionRoutes";
import cors from "cors";
import { latestBlockRoutes } from "./routes/latestBlockRoutes";
import { ethers } from "ethers";
import {
  Brevis,
  ErrCode,
  ProofRequest,
  Prover,
  TransactionData,
} from "brevis-sdk-typescript";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
connectDB();

function middleware(req: Request, res: Response, next: any) {
  console.log(req.originalUrl);
  next();
}
app.use(middleware);

app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/latest-block", latestBlockRoutes);

app.get("/", (req, res) => {
  res.send("backend working!!!!");
  console.log("Working");
});

app.post("/request-verify-with-bervis", async (req: Request, res: Response) => {
  try {
    const { address } = req.body;

    let firstMintlogtoAddress;

    const prover = new Prover("localhost:33247");
    const brevis = new Brevis("appsdkv2.brevis.network:9094");

    const proofReq = new ProofRequest();

    const provider = new ethers.providers.JsonRpcProvider(
      "https://sepolia.infura.io/v3/e9381503bc9e4d86a03cc3d394f64be1"
    );

    // Contract details
    const contractAddress = "0x303860D21B14B8d2072AF6FDf8345e1d9311630B";
    //   const fromBlock = 12714696; // Starting block number
    const maxBlockRange = 500; // Maximum block range allowed by provider
    const latestBlock = await provider.getBlockNumber();

    console.log(`Latest block: ${latestBlock}`);

    let startBlock = 7086578;
    const allLogs = [];

    while (startBlock <= latestBlock) {
      // Set the end block to either the last block in the range or the latest block
      const endBlock = Math.min(startBlock + maxBlockRange - 1, latestBlock);

      // Define the filter for the current chunk
      const filter = {
        topics: [
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          `0x000000000000000000000000${address.slice(2)}`,
        ],
        address: contractAddress,
        fromBlock: startBlock,
        toBlock: endBlock,
      };

      try {
        // Fetch logs for the current chunk and add to allLogs array
        const logs = await provider.getLogs(filter);
        console.log("going to fetch logs");
        if (logs.length > 0) {
          firstMintlogtoAddress = logs[0];
          console.log("First Mint Log to Address", firstMintlogtoAddress);
          break;
        }
      } catch (error) {
        console.error(
          `Error fetching logs from ${startBlock} to ${endBlock}:`,
          error
        );
      }
      // Move to the next chunk
      startBlock = endBlock + 1;
    }
    if (firstMintlogtoAddress == null) {
      res.status(200).json({ message: "No logs found" });
      return;
    }
    const hash = firstMintlogtoAddress?.transactionHash;
    console.log(firstMintlogtoAddress?.transactionHash);
    // console.log(`Get transaction info for ${hash}`);
    const transaction = await provider.getTransaction(String(hash));

    // console.log(transaction);

    if (transaction.type != 0 && transaction.type != 2) {
      console.error("only type0 and type2 transactions are supported");
      return;
    }

    const receipt = await provider.getTransactionReceipt(String(hash));

    console.log("Receipt Printed");

    var gas_tip_cap_or_gas_price = "";
    var gas_fee_cap = "";
    if ((transaction.type = 0)) {
      gas_tip_cap_or_gas_price = transaction.gasPrice?._hex ?? "";
      gas_fee_cap = "0";
    } else {
      gas_tip_cap_or_gas_price = transaction.maxPriorityFeePerGas?._hex ?? "";
      gas_fee_cap = transaction.maxFeePerGas?._hex ?? "";
    }

    proofReq.addTransaction(
      new TransactionData({
        hash: hash,
        chain_id: transaction.chainId,
        block_num: receipt.blockNumber,
        nonce: transaction.nonce,
        gas_tip_cap_or_gas_price: gas_tip_cap_or_gas_price,
        gas_fee_cap: gas_fee_cap,
        gas_limit: transaction.gasLimit.toNumber(),
        from: transaction.from,
        to: transaction.to,
        value: transaction.value._hex,
      })
    );

    console.log(proofReq);

    console.log("Transaction added");

    // console.log(`Send prove request for ${hash}`);

    const proofRes = await prover.prove(proofReq);

    console.log("Got Proof Response");

    // error handling
    if (proofRes.has_err) {
      const err = proofRes.err;
      switch (err.code) {
        case ErrCode.ERROR_INVALID_INPUT:
          console.error("invalid receipt/storage/transaction input:", err.msg);
          break;

        case ErrCode.ERROR_INVALID_CUSTOM_INPUT:
          console.error("invalid custom input:", err.msg);
          break;

        case ErrCode.ERROR_FAILED_TO_PROVE:
          console.error("failed to prove:", err.msg);
          break;
      }
      return;
    }
    console.log("proof", proofRes.proof);

    try {
      const callbackaddress = "0x9d564Dc4e20ab5d3991e2D6FB56E7F34861599df";

      const brevisRes = await brevis.submit(
        proofReq,
        proofRes,
        11155111,
        11155111,
        0,
        "",
        callbackaddress
      );
      //     console.log('brevis res', brevisRes);

      //     console.log(brevisRes.queryKey.query_hash);

      console.log("================================================");
      console.log(
        brevisRes.queryKey.query_hash,
        brevisRes.queryKey.nonce,
        "0xAFE08919dAC82E79ae274eb94441AA2447Bb13b6",
        [callbackaddress, brevisRes.fee],
        0,
        { value: brevisRes.fee }
      );
      console.log("================================================");

      res.send({
        _0: brevisRes.queryKey.query_hash,
        _1: brevisRes.queryKey.nonce,
        _2: "0xAFE08919dAC82E79ae274eb94441AA2447Bb13b6",
        _3: [callbackaddress, brevisRes.fee],
        _4: 0,
        _5: { value: brevisRes.fee },
      });
    } catch (err) {
      res.send("Error");
      console.error(err);
    }
  } catch (err) {
    console.error(err);
  }
});

app.listen(8080, () => {
  console.log("server running at port : 8080");
});
