import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { chroniclePriceFeed } from "@/lib/chroniclePriceFeed/chroniclePriceFeed";
import { useAccount, useWriteContract } from "wagmi";
import { ERC20ABI } from "@/lib/abi/ERC20Abi";
import { useGlobalContext } from "@/lib/context/GlobalContextProvider";
import chrono from "/CHRONO.png";

export default function FaucetPage() {
  const { address: userAddress, chain, chainId } = useAccount();
  const { ChronoToken, isEarlyUser } = useGlobalContext();
  const { writeContractAsync } = useWriteContract();

  console.log("isEarlyUser", isEarlyUser);

  const [claimingStates, setClaimingStates] = useState<{
    [key: number]: boolean;
  }>({});

  const handleClaim = async (tokenId: number) => {
    setClaimingStates((prev) => ({ ...prev, [tokenId]: true }));

    const mintAmount = isEarlyUser
      ? chroniclePriceFeed[tokenId - 1]?.amount * 2
      : chroniclePriceFeed[tokenId - 1]?.amount;

    // Simulating API call

    if (tokenId === 11) {
      await writeContractAsync({
        address: ChronoToken,
        abi: ERC20ABI,
        functionName: "mint",
        args: [userAddress, 10n ** 19n],
        chain: chain,
        account: userAddress,
      });

      return;
    }
    await writeContractAsync({
      address: chroniclePriceFeed[tokenId - 1]?.address,
      abi: ERC20ABI,
      functionName: "mint",
      args: [userAddress, mintAmount * 10 ** 18],
      chain: chain,
      account: userAddress,
    });

    // setClaimingStates((prev) => ({ ...prev, [tokenId]: false }));
    toast.success(
      `Successfully claimed ${
        chroniclePriceFeed.find((t) => t.id === tokenId)?.name
      }!`,
      {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-white shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Testnet Faucet
            </CardTitle>
            <CardDescription className="mt-2 text-gray-600">
              Claim testnet tokens for your development needs. Please use
              responsibly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chroniclePriceFeed.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-inner">
                      <img
                        src={token.logo}
                        alt={`${token.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {token.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {isEarlyUser ? token.amount * 2 : token.amount} tokens
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleClaim(token.id)}
                    disabled={claimingStates[token.id]}
                    className={`transition-all duration-200 ease-in-out transform text-black ${
                      claimingStates[token.id]
                        ? "scale-95 opacity-75"
                        : "hover:scale-105"
                    }`}
                  >
                    {claimingStates[token.id] ? (
                      <Skeleton className="h-5 w-20" />
                    ) : (
                      "Claim"
                    )}
                  </Button>
                </div>
              ))}

              <div
                key={11}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-inner">
                    <img
                      src={chrono}
                      alt={`${"Chrono"} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {"Chrono"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {isEarlyUser ? 100 * 2 : 100} tokens
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleClaim(11)}
                  disabled={claimingStates[11]}
                  className={`transition-all duration-200 ease-in-out transform text-black ${
                    claimingStates[11]
                      ? "scale-95 opacity-75"
                      : "hover:scale-105"
                  }`}
                >
                  {claimingStates[11] ? (
                    <Skeleton className="h-5 w-20" />
                  ) : (
                    "Claim"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <ToastContainer />
    </div>
  );
}
