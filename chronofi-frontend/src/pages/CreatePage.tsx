import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { useGlobalContext } from "@/lib/context/GlobalContextProvider";
import { ChronoFiAbi } from "@/lib/abi/ChronoFiAbi";
import { chroniclePriceFeed } from "@/lib/chroniclePriceFeed/chroniclePriceFeed";
import { ChronofiPriceOracleABI } from "@/lib/abi/ChronofiPriceOracleABI";
import { SignProtocolClient, SpMode, EvmChains } from "@ethsign/sp-sdk";
import { toast } from "react-toastify";

export default function CreateSubscription() {
  const [name, setName] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amountInUSD, setAmountInUSD] = useState(0);
  const [frequency, setFrequency] = useState(0);
  const [frequencyUnit, setFrequencyUnit] = useState("3600");
  const [paymentToken, setPaymentToken] = useState("UNI");
  const [customToken, setCustomToken] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");

  const { data: hash, writeContract } = useWriteContract();
  const { ChronoFiAddress, PriceOracleAddress, schemaId } = useGlobalContext();
  const { address, chainId } = useAccount();

  const tokenDetail = chroniclePriceFeed?.find(
    (tokenDetail) => tokenDetail?.name === paymentToken
  );

  const client = new SignProtocolClient(SpMode.OnChain, {
    chain: EvmChains.sepolia,
  });

  const { data: price, error } = useReadContract({
    address: ChronoFiAddress,
    functionName: "convertUSDToToken",
    args: [tokenDetail?.address, amountInUSD],
    abi: ChronoFiAbi,
    chainId: chainId,
  });

  useEffect(() => {
    const updateTokenAmount = async () => {
      if (price) {
        setTokenAmount((Number(price) / 10 ** 18).toFixed(2));
      }
    };
    updateTokenAmount();
  }, [amountInUSD, paymentToken, price]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!tokenDetail) {
      toast.error("Invalid token selected");
      return;
    }
    if (amountInUSD <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    if (frequency <= 0) {
      toast.error("Frequency must be greater than 0");
      return;
    }

    console.log({
      schemaId: schemaId,
      data: {
        name,
        recipient,
        paymentToken: tokenDetail?.address,
        amountInUSD,
        frequency: frequency * Number(frequencyUnit),
      },
      indexingValue: address,
    });

    await client.createAttestation({
      schemaId: schemaId,
      data: {
        name,
        recipient,
        paymentToken: tokenDetail?.address,
        amountInUSD,
        frequency: frequency * Number(frequencyUnit),
      },
      indexingValue: address,
    });

    toast.success("Attestation created successfully!");
  };

  return (
    <Card className="w-full h-100vh max-w-3xl mx-auto mt-16 bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-white">
          Create Subscription
        </CardTitle>
        <CardDescription className="text-gray-200">
          Set up a new recurring payment subscription
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white font-semibold">
              Subscription Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-gray-100 text-gray-900"
              placeholder="Enter subscription name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recipient" className="text-white font-semibold">
              Recipient Address
            </Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
              className="bg-gray-100 text-gray-900"
              placeholder="Enter recipient address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-white font-semibold">
              Amount in USD
            </Label>
            <Input
              id="amount"
              type="number"
              value={amountInUSD}
              onChange={(e) => setAmountInUSD(Number(e.target.value))}
              required
              className="bg-gray-100 text-gray-900"
              placeholder="Enter amount in USD"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency" className="text-white font-semibold">
                Frequency
              </Label>
              <Input
                id="frequency"
                type="number"
                value={frequency}
                onChange={(e) => setFrequency(Number(e.target.value))}
                required
                className="bg-gray-100 text-gray-900"
                placeholder="Enter frequency"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="frequencyUnit"
                className="text-white font-semibold"
              >
                Unit
              </Label>
              <Select value={frequencyUnit} onValueChange={setFrequencyUnit}>
                <SelectTrigger
                  id="frequencyUnit"
                  className="bg-gray-100 text-gray-900"
                >
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="60">Minutes</SelectItem>
                  <SelectItem value="3600">Hours</SelectItem>
                  <SelectItem value="86400">Days</SelectItem>
                  <SelectItem value="604800">Weeks</SelectItem>
                  <SelectItem value="2592000">Months</SelectItem>
                  <SelectItem value="31536000">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="paymentToken" className="text-white font-semibold">
              Payment Token
            </Label>
            <Select value={paymentToken} onValueChange={setPaymentToken}>
              <SelectTrigger
                id="paymentToken"
                className="bg-gray-100 text-gray-900"
              >
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                {chroniclePriceFeed.map((token, index) => (
                  <SelectItem key={index} value={token.name}>
                    {token.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {paymentToken === "Other" && (
            <div className="space-y-2">
              <Label htmlFor="customToken" className="text-white font-semibold">
                Custom Token Address
              </Label>
              <Input
                id="customToken"
                value={customToken}
                onChange={(e) => setCustomToken(e.target.value)}
                placeholder="Enter token address"
                required
                className="bg-gray-100 text-gray-900"
              />
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-white font-semibold">
              Estimated Token Amount
            </Label>
            <p className="text-sm font-medium text-gray-200">
              {tokenAmount} {paymentToken}
            </p>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <button
          type="submit"
          className="w-full py-3 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold"
          onClick={handleSubmit}
        >
          Create Subscription
        </button>
      </CardFooter>
    </Card>
  );
}
