import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccount, useReadContract } from "wagmi";
import { useGlobalContext } from "@/lib/context/GlobalContextProvider";
import { ChronoFiAbi } from "@/lib/abi/ChronoFiAbi";
import SubscriptionCard from "@/components/ui/subscriptioncard";

export default function Dashboard() {
  const { ChronoFiAddress } = useGlobalContext();

  const { address, chainId } = useAccount();
  const { data, error } = useReadContract({
    address: ChronoFiAddress,
    abi: ChronoFiAbi,
    functionName: "getUserIntents",
    args: [address],
    chainId,
  });

  console.log(address, data, error);

  return (
    <div className="h-full flex justify-center  flex-col items-center p-7 ">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="flex flex-wrap gap-6 justify-center ">
        {data === undefined && <div>Loading...</div>}
        {data && (data as any[]).length === 0 && (
          <div>No subscriptions found</div>
        )}
        {(data as any[])?.map((subscription, index) => (
          <SubscriptionCard
            key={index}
            subscription={subscription}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
