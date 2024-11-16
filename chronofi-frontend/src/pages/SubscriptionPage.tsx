import React from "react";
import { useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  FaDollarSign,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaCog,
} from "react-icons/fa";
import { useGlobalContext } from "@/lib/context/GlobalContextProvider";
import { ChronoFiAbi } from "@/lib/abi/ChronoFiAbi";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { readContract } from "@wagmi/core";
import { config } from "@/lib/config";
import { ERC20ABI } from "@/lib/abi/ERC20Abi";

interface Subscription {
  name: string;
  subscriptionOwner: string;
  recipient: string;
  paymentToken: `0x${string}`;
  amountInUSD: bigint;
  attestationId: bigint;
  frequency: bigint;
  nextPaymentDate: bigint;
  hasExited: boolean;
}

function SubscriptionPage() {
  const [isExecutable, setIsExecutable] = React.useState(false);
  const [hasEnoughBalance, setHasEnoughBalance] = React.useState(false);
  const { ChronoFiAddress, ChronoToken } = useGlobalContext();
  const { address: userAddress, chainId, chain } = useAccount();
  const { address, id } = useParams();
  const { writeContract, error } = useWriteContract();

  const { data } = useReadContract({
    address: ChronoFiAddress,
    abi: ChronoFiAbi,
    functionName: "getIntent",
    args: [address, id],
    chainId: chainId,
  });

  console.log(error);

  // Fetching executable and balance status
  React.useEffect(() => {
    readContract(config, {
      address: ChronoFiAddress,
      abi: ChronoFiAbi,
      functionName: "isExecutable",
      args: [address, id],
    }).then((result) => setIsExecutable(result as boolean));

    readContract(config, {
      address: ChronoFiAddress,
      abi: ChronoFiAbi,
      functionName: "hasEnoughBalance",
      args: [address, id],
    }).then((result) => setHasEnoughBalance(result as boolean));
  }, [address, id, ChronoFiAddress]);

  if (data === undefined) return <p>Subscription not found.</p>;

  const subscription = data as Subscription;
  const name = subscription.name;
  const recipient = subscription.recipient;
  const paymentToken = subscription.paymentToken;
  const amountInUSD = Number(subscription.amountInUSD).toFixed(2);
  const nextPaymentDate = Number(subscription.nextPaymentDate);
  const hasExited = Boolean(subscription.hasExited);

  const currentTime = Date.now();
  const nextPaymentDue = new Date(nextPaymentDate * 1000);
  const isDue = nextPaymentDate < currentTime;
  console.log(isDue);

  const nextPaymentLabel = hasExited ? (
    <span className="text-red-500 flex items-center">
      <FaTimesCircle className="mr-1" /> Exited
    </span>
  ) : isDue ? (
    <span className="text-yellow-500 flex items-center">
      <FaExclamationTriangle className="mr-1" /> Payment Due
    </span>
  ) : (
    <span className="text-green-500 flex items-center">
      <FaCheckCircle className="mr-1" /> Next Payment:{" "}
      {formatDistanceToNow(nextPaymentDue, { addSuffix: true })}
    </span>
  );

  const handleApprovePaymentToken = () => {
    console.log("Approved Payment Token");
    // Approve payment token logic

    writeContract({
      address: paymentToken,
      abi: ERC20ABI,
      functionName: "approve",
      args: [
        ChronoFiAddress,
        115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      ],
      chain: chain,
      account: userAddress,
    });
  };

  const handleApproveChronoToken = () => {
    console.log("Approved Chrono Token");
    // Approve Chrono token logic

    writeContract({
      address: ChronoToken,
      abi: ERC20ABI,
      functionName: "approve",
      args: [
        ChronoFiAddress,
        115792089237316195423570985008687907853269984665640564039457584007913129639935n,
      ],
      chain: chain,
      account: userAddress,
    });
  };

  return (
    <div className="subscription-detail p-8 rounded-lg shadow-2xl bg-gray-100 text-gray-800 space-y-6">
      <h2 className="text-3xl font-extrabold text-blue-700 mb-4">{name}</h2>

      <div className="text-xl font-medium flex items-center space-x-2">
        <FaDollarSign className="text-green-500" />
        <p>
          Amount to be Deducted: <strong>${amountInUSD}</strong> in{" "}
          {paymentToken}
        </p>
      </div>

      <div className="space-y-3">
        <p>
          <strong>Recipient:</strong> {recipient}
        </p>
        <p>
          <strong>Payment Status:</strong> {nextPaymentLabel}
        </p>
      </div>

      {isExecutable && hasEnoughBalance && (
        <div className="bg-blue-100 text-blue-800 p-4 rounded-md flex items-center space-x-2">
          <FaCog className="animate-spin" />
          <p>
            Waiting for the solver to initiate the transaction. Please wait...
          </p>
        </div>
      )}

      {isDue && !hasEnoughBalance && (
        <div className="bg-red-100 text-red-800 p-4 rounded-md space-y-4">
          <p className="flex items-center space-x-2">
            <FaExclamationTriangle className="text-yellow-500" />
            <span>Your balance is insufficient or allowance is too low.</span>
          </p>
          <div className="flex space-x-4">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              onClick={handleApprovePaymentToken}
            >
              Allow Payment Token
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              onClick={handleApproveChronoToken}
            >
              Allow Chrono Token
            </button>
          </div>
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
            onClick={() => (window.location.href = "/faucet")}
          >
            Low on Funds? Get Funds from Faucet
          </button>
        </div>
      )}

      {/* {isDue && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-md">
          <p>
            <FaExclamationTriangle className="inline mr-2" /> Payment is due!
            Ensure sufficient funds or increase allowance as needed.
          </p>
        </div>
      )} */}
    </div>
  );
}

export default SubscriptionPage;
