import React from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaTimesCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";

function SubscriptionCard({ subscription, index }) {
  const { address } = useAccount();
  const navigate = useNavigate();
  let {
    name,
    recipient,
    paymentToken,
    amountInUSD,
    nextPaymentDate,
    hasExited,
  } = subscription;

  amountInUSD = Number(amountInUSD);
  nextPaymentDate = Number(nextPaymentDate);
  //   hasExited = Boolean(!hasExited);

  const currentTime = Date.now();
  const nextPaymentDue = nextPaymentDate * 1000;

  console.log(nextPaymentDue);

  console.log(currentTime);

  const isDue = nextPaymentDue < currentTime;
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

  const handleCardClick = () => navigate(`/${address}/${index}`);

  return (
    <div
      onClick={handleCardClick}
      className="subscription-card cursor-pointer p-6 rounded-xl shadow-lg bg-white hover:shadow-xl transition-shadow duration-300 transform hover:scale-105"
    >
      <motion.div
        whileHover={{ scale: 1.05 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="subscription-card cursor-pointer p-6 rounded-xl shadow-lg bg-white hover:shadow-xl"
        onClick={handleCardClick}
      >
        <h2 className="text-2xl font-semibold mb-2 text-blue-600">{name}</h2>
        <p className="text-gray-600">
          <strong>Recipient:</strong> {recipient}
        </p>
        <p className="text-gray-600">
          <strong>Token:</strong> {paymentToken}
        </p>
        <p className="text-gray-800 font-semibold">
          <strong>Amount in USD:</strong> ${amountInUSD}
        </p>
        <div className="mt-4 text-sm font-medium">{nextPaymentLabel}</div>
      </motion.div>
    </div>
  );
}

export default SubscriptionCard;
