const io = require("socket.io-client");
require("dotenv").config();
const socket = io("http://localhost:5000/");
const { getThresholdKey } = require("./utils/getThresholdKey");
const abi = require("./utils/contractabi.json");
const express = require("express");
const http = require("http");
const cors = require("cors");
const { ethers } = require("ethers");
const { default: axios } = require("axios");
const { getContract } = require("./utils/getContract");
const {
  checkPendingTransactions,
} = require("./listeners/checkPendingTransactions");
require("dotenv").config();

console.log(process.argv);

const PORT = process.argv[3] || 4000;

const app = express();
const server = http.createServer(app);

app.use(cors());

const runVerifyNode = async () => {
  const TOTAL_NODES = 5;
  const MIN_NO_NODES_REQUIRED = 3;
  const nodeIndex = process.argv[2] || 0;
  // console.log(NodeIndex);
  const thresholdKey = await getThresholdKey(
    nodeIndex,
    TOTAL_NODES,
    MIN_NO_NODES_REQUIRED
  );
  let subscription;
  socket.on("connect", async () => {
    const res = await axios.get(
      "http://localhost:8080/api/subscriptions/get-subscriptions"
    );
    subscription = res.data;
    console.log("subscriptions length : " + subscription.length);

    console.log("Socket connected");

    setInterval(async () => {
      await checkPendingTransactions(
        subscription,
        thresholdKey,
        socket,
        nodeIndex
      );
    }, 1 * 60 * 1000);
  });

  socket.on("SolversUpdateSubscriptions", async () => {
    let res = await axios.get(
      "http://localhost:8080/api/subscriptions/get-subscriptions"
    );
    subscription = res.data;
    console.log("Subscriptions Updated");
  });
};

runVerifyNode();

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
