const { ethers } = require("ethers");
const { getContract } = require("../utils/getContract");
const { default: axios } = require("axios");

const SubscriptionCreatedListener = async (socketManager) => {
  const contract = await getContract();

  const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);
  // Event Listener
  console.log("SubscriptionCreated Listener Initialized");

  contract.on(
    "SubscriptionCreated",
    async (user, subscriptionId, name, amountInUSD, paymentToken, event) => {
      console.log("SubscriptionCreated Event Detected:");
      console.log("User Address:", user);
      console.log("Subscription ID:", subscriptionId.toString());
      console.log("Subscription Name:", name);
      console.log(
        "Amount in USD:",
        ethers.utils.formatUnits(amountInUSD, "wei")
      ); // Adjust decimals if needed
      console.log("Payment Token Address:", paymentToken);
      try {
        await axios.post(
          "http://localhost:8080/api/subscriptions/create-subscription",
          {
            address: ethers.utils.getAddress(user),
            subscriptionId: parseInt(subscriptionId),
            nameofSubscription: name,
            amountinUSD: ethers.utils.formatUnits(amountInUSD, "wei"),
            paymentToken: paymentToken,
          }
        );
        socketManager.broadcastToAll("SolversUpdateSubscriptions");

        const latestBlock = await provider.getBlockNumber();

        try {
          await axios.post(
            "http://localhost:8080/api/latest-block/update-latest-block",
            { latestBlock: latestBlock }
          );
          console.log("updated Latest block : ", latestBlock);
        } catch (error) {
          console.log(error);
        }
      } catch (error) {
        console.log(error);
      }
    }
  );
};

module.exports = { SubscriptionCreatedListener };
