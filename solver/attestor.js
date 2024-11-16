const { Server } = require("socket.io");
const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const retriveOldLogs = require("./utils/retriveOldLogs");
const shamir = require("shamir-secret-sharing");
const ethers = require("ethers");
const axios = require("axios");
const {
  SubscriptionCreatedListener,
} = require("./listeners/IntentCreationListener");
const { getContract } = require("./utils/getContract");
require("dotenv").config();

const port = 5000;
const app = express();
const server = new createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
app.use(cors());

// Store connected sockets
let connectedSockets = new Set();
let map = new Map();
const MIN_NO_NODES_REQUIRED = 3;

// Socket management functions
const socketManager = {
  addSocket: (socket) => {
    connectedSockets.add(socket);
    console.log(
      `Socket ${socket.id} added. Total connections: ${connectedSockets.size}`
    );
  },

  removeSocket: (socket) => {
    connectedSockets.delete(socket);
    console.log(
      `Socket ${socket.id} removed. Total connections: ${connectedSockets.size}`
    );
  },

  // Broadcast to all connected sockets
  broadcastToAll: (eventName, data) => {
    connectedSockets.forEach((socket) => {
      socket.emit(eventName, data);
    });
    console.log(`Broadcasted ${eventName} to ${connectedSockets.size} sockets`);
  },
};

async function RunAttestorNode() {
  try {
    const res = await axios.get(
      "http://localhost:8080/api/latest-block/get-latest-block"
    );
    const previousBlock = res.data.LatestBlock || 7086539;
    console.log("from Block " + previousBlock);
    await retriveOldLogs(previousBlock, socketManager);
  } catch (error) {
    console.log(error);
  }

  // Initialize subscription listener with socket manager
  SubscriptionCreatedListener(socketManager);

  // Handle socket connections
  io.on("connection", (socket) => {
    console.log("====================================");
    console.log("Solver connected");
    console.log("====================================");

    // Add socket to our managed collection
    socketManager.addSocket(socket);

    socket.on("join", ({ data }) => {
      console.log("received threshold key");
    });

    socket.on("subscription", async ({ user, subscriptionId, NodeIndex }) => {
      console.log("subscription event received on node ", NodeIndex);
    });

    socket.on("PendingTransactionisReadyForExecution", async (data) => {
      console.log(
        "PendingTransactionisReadyForExecution event received from : ",
        data.nodeIndex
      );
      // console.log(data);
      let uint8Array = new Uint8Array(data.thresholdKey);
      let mapkey = {
        address: data.address,
        subscriptionId: data.subscriptionId,
        transactionId: data.transactionId,
      };

      const mapvalue = {
        thresholdKey: uint8Array,
        nodeIndex: data.nodeIndex,
      };

      mapkey = JSON.stringify(mapkey);

      if (map.has(mapkey)) {
        console.log("updating");
        map.get(mapkey).push(mapvalue); // Retrieve the existing array directly
      } else {
        console.log("new data");
        map.set(mapkey, [mapvalue]);
      }

      shares = removeDuplicateUint8Arrays(getthresholdkey(map.get(mapkey)));
      // console.log(shares);

      if (shares.length >= MIN_NO_NODES_REQUIRED) {
        try {
          console.log("achieved required amount");

          const uint8arrprivatekey = await combineShares(shares);

          // console.log(uint8arrprivatekey);

          const privateKey = uint8ArrayToHex(uint8arrprivatekey);

          // console.log("privateKey : " + privateKey);

          const provider = new ethers.providers.JsonRpcProvider(
            process.env.INFURA_URL
          );
          const wallet = new ethers.Wallet(privateKey, provider);
          const contract = await getContract();
          const solverContract = await contract.connect(wallet);
          const tx = await solverContract.processPayment(
            data.address,
            data.subscriptionId
          );
          console.log("tx hash", tx.hash);
          const receipt = await tx.wait();

          console.log("receipt");
          console.log(receipt.logs);

          const log = receipt.logs.filter((val) => {
            return val.address.toLowerCase() == contract.address.toLowerCase();
          });

          console.log(log);

          const decoded = ethers.utils.defaultAbiCoder.decode(
            ["uint256", "uint256", "address"],
            log[0].data
          );

          const subscription = await contract.getSubscription(
            data.address,
            data.subscriptionId
          );

          console.log({
            address: data.address,
            subscriptionId: data.subscriptionId,
            amount: Number(ethers.utils.formatUnits(decoded[0], "wei")),
            paymentToken: decoded[2],
            transactionUrl: tx.hash,
            nameofSubscription: subscription.name,
          });

          await axios.post(
            "http://localhost:8080/api/transactions/create-transaction",
            {
              address: data.address,
              subscriptionId: data.subscriptionId,
              amount: Number(ethers.utils.formatUnits(decoded[0], "wei")),
              paymentToken: decoded[2],
              transactionUrl: tx.hash,
              nameofSubscription: subscription.name,
            }
          );
          console.log("transaction created");
        } catch (error) {
          console.log("error in getting tx", error);
        }
      }
    });

    // Remove socket when disconnected
    socket.on("disconnect", () => {
      socketManager.removeSocket(socket);
    });
  });

  server.listen(port, () => console.log(`server is running ${port}`));
}

RunAttestorNode();

async function combineShares(shares) {
  // Reconstruct the private key using Shamir's Secret Sharing
  const privateKeyHex = await shamir.combine(shares);

  // Return the reconstructed private key
  return privateKeyHex;
}

function getthresholdkey(arr) {
  return arr.map((val) => {
    return val.thresholdKey;
  });
}

function removeDuplicateUint8Arrays(arrays) {
  const set = new Set();

  return arrays.filter((array) => {
    const stringRepresentation = array.toString();
    if (set.has(stringRepresentation)) {
      return false; // Duplicate found
    }
    set.add(stringRepresentation);
    return true; // Unique array
  });
}

function uint8ArrayToHex(uint8Array) {
  return uint8Array.reduce(
    (str, byte) => str + byte.toString(16).padStart(2, "0"),
    ""
  );
}
