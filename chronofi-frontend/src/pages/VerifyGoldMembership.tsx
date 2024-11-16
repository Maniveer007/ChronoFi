import axios from "axios";
import { useState } from "react";
import { createPublicClient, http, parseAbiItem } from "viem";
import { useAccount, useWriteContract } from "wagmi";
import { sepolia } from "wagmi/chains";
import { abi } from "@/lib/abi/BervisRequestAbi";
import { useGlobalContext } from "@/lib/context/GlobalContextProvider";

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
});

const VerifyGoldMembership = () => {
  const { data: hash, writeContract, isPending } = useWriteContract();
  const { address, chainId, chain } = useAccount();
  const { BervisRequestAddress } = useGlobalContext();
  const [isLoading, setIsLoading] = useState(false);

  const verifyMembership = async () => {
    try {
      setIsLoading(true);

      if (!address) {
        window.alert("Please connect your wallet");
        setIsLoading(false);
        return;
      }

      console.log("sent request to backend");

      const res = await axios.post(
        "http://www.localhost:8080/request-verify-with-bervis",
        { address }
      );
      console.log("got response from backend");

      console.log(res.data);

      const result = await writeContract({
        address: BervisRequestAddress,
        abi: abi,
        functionName: "sendRequest",
        args: [res.data._0, res.data._1, res.data._2, res.data._3, res.data._4],
        chain: chain,
        account: address,
        value: res.data._5.value,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-screen bg-gradient-to-b from-blue-500 to-purple-600">
        <div className="text-center space-y-6">
          <div className="animate-bounce">
            <span className="text-6xl">🌟</span>
          </div>
          <h2 className="text-4xl font-bold text-white">
            Verifying Your Gold Status
          </h2>
          <div className="flex space-x-3">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse delay-100"></div>
            <div className="w-3 h-3 bg-white rounded-full animate-pulse delay-200"></div>
          </div>
          <div className="max-w-md text-white text-lg">
            <p className="mb-4">
              Checking your on-chain history with Bervis...
            </p>
            <p className="text-yellow-200">
              This magical moment will be over soon! ✨
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-gradient-to-b from-white to-gray-100 p-8">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ChronoFi Gold Membership Verification
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Early User Benefits
          </h2>
          <ul className="text-left text-gray-600 space-y-3 mb-6">
            <li className="flex items-center">
              <span className="mr-2">✨</span>
              Zero protocol fees for verified early users
            </li>
            <li className="flex items-center">
              <span className="mr-2">🎯</span>
              Must have used ChronoFi before hackathon deadline
            </li>
            <li className="flex items-center">
              <span className="mr-2">🔍</span>
              Verification powered by Bervis on-chain data
            </li>
          </ul>
        </div>

        <button
          onClick={verifyMembership}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transform transition-all hover:scale-105 shadow-lg disabled:opacity-50"
        >
          Verify Gold Membership
        </button>

        <p className="text-sm text-gray-500 mt-4">
          Click verify to check your eligibility for Gold Membership status
        </p>
      </div>
    </div>
  );
};

export default VerifyGoldMembership;
