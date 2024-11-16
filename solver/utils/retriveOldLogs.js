const { default: axios } = require("axios");
const { ChronoFiAddress } = require("./constants");
const { ethers } = require("ethers");

const retriveOldLogs = async (previousBlock, socketManager) => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);

  //   const fromBlock = 12714696; // Starting block number
  const maxBlockRange = 500; // Maximum block range allowed by provider
  const latestBlock = await provider.getBlockNumber();

  async function fetchLogsInChunks() {
    console.log(`Latest block: ${latestBlock}`);

    let startBlock = previousBlock;
    const allLogs = [];

    while (startBlock <= latestBlock) {
      // Set the end block to either the last block in the range or the latest block
      const endBlock = Math.min(startBlock + maxBlockRange - 1, latestBlock);

      // Define the filter for the current chunk
      const filter = {
        topics: [
          "0x7bf302792fcbb78145915736d08381b36762837975fdf0c8afafa0ff4818cf7b",
        ],
        address: ChronoFiAddress,
        fromBlock: startBlock,
        toBlock: endBlock,
      };

      try {
        // Fetch logs for the current chunk and add to allLogs array
        const logs = await provider.getLogs(filter);
        // console.log(logs);

        allLogs.push(...logs);
      } catch (error) {
        console.error(
          `Error fetching logs from ${startBlock} to ${endBlock}:`,
          error
        );
      }

      // Move to the next chunk
      startBlock = endBlock + 1;
    }

    console.log(allLogs);

    // Process all logs after fetching
    allLogs.forEach(async (log) => {
      const decoded = ethers.utils.defaultAbiCoder.decode(
        ["string", "uint256", "address"],
        log.data
      );
      //   console.log(decoded);
      try {
        console.log(ethers.utils.formatUnits(decoded[1], "wei"));
        await axios.post(
          "http://localhost:8080/api/subscriptions/create-subscription",
          {
            address: ethers.utils.getAddress(`0x${log.topics[1].slice(-40)}`),
            subscriptionId: parseInt(log.topics[2]),
            nameofSubscription: decoded[0],
            amountinUSD: ethers.utils.formatUnits(decoded[1], "wei"),
            paymentToken: decoded[2],
          }
        );
      } catch (error) {
        console.log("error");
      }

      //   console.log(`Log Block Number: ${log.blockNumber}`);
      //   console.log(`Log Data: ${log.data}`);
      //   console.log(parseInt(log.topics[2]));
      //   const address = log.topics[1].slice(-40);
      //   console.log(address);

      // Convert to an Ethereum address format (checksumming the address)
      //   const formattedAddress = ethers.utils.getAddress(`0x${address}`);

      //   console.log("Formatted Address:", formattedAddress);

      //   console.log(`Log Topics: ${log.topics[1]}`);
      //   console.log(
      //     `Log Topics: ${ethers.utils.getAddress(
      //       ethers.utils.hexZeroPad(log.topics[1], 20)
      //     )}`
      //   );
      console.log("--------------------------");
    });

    socketManager.broadcastToAll("SolversUpdateSubscriptions");
  }
  // Call the function
  fetchLogsInChunks().then(async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/latest-block/update-latest-block",
        { latestBlock: latestBlock }
      );
      console.log("updated Latest block : ", latestBlock);
    } catch (error) {}
  });
};

module.exports = retriveOldLogs;
// retriveOldLogs();
