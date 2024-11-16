const { default: axios } = require("axios");
const { getContract } = require("../utils/getContract");

async function checkPendingTransactions(
  subscription,
  thresholdKey,
  socket,
  nodeIndex
) {
  const contract = await getContract();
  await subscription.forEach(async (sub) => {
    try {
      console.log("checking : " + sub.subscriptionId);

      const isExecutable = await contract.isPaymentExecutable(
        sub.address,
        sub.subscriptionId
      );

      if (isExecutable) {
        console.log("Subscription is executable");

        const hasEnoughBalance = await contract.hasEnoughBalance(
          sub.address,
          sub.subscriptionId
        );
        if (hasEnoughBalance) {
          const res = await axios.get(
            "http://localhost:8080/api/transactions/get-transaction-by-subscription-id",
            {
              address: sub.address,
              subscriptionId: sub.subscriptionId,
            }
          );
          const transactionId = res.data.length + 1;
          const data = {
            address: sub.address,
            subscriptionId: sub.subscriptionId,
            transactionId: transactionId,
            thresholdKey: thresholdKey,
            nodeIndex: nodeIndex,
          };

          socket.emit("PendingTransactionisReadyForExecution", data);
        } else {
          console.log(
            "Not enough balance or allowance to execute the transaction"
          );
        }
      }
      await delay(100);
    } catch (e) {
      console.log("error");
    }
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = { checkPendingTransactions };
