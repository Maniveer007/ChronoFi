import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import axios from "axios";
import { useAccount } from "wagmi";
import { chroniclePriceFeed } from "@/lib/chroniclePriceFeed/chroniclePriceFeed";

interface Transaction {
  _id: string;
  nameofSubscription: string;
  amountinTokens: number;
  paymentToken: string;
  transactionUrl: string;
  transationAt: string;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { address } = useAccount();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.post(
          `http://localhost:8080/api/transactions/get-transactions-by-address/`,
          { address }
        );
        console.log("====================================");
        console.log(response);
        console.log("====================================");
        setTransactions(response.data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
    };

    if (address) {
      fetchTransactions();
    }
  }, [address]);

  const getTokenImage = (token: string) => {
    const tokenDetails = chroniclePriceFeed.find(
      (t) => t.address.toLowerCase() === token.toLowerCase()
    );
    return tokenDetails ? tokenDetails.logo : "/default-token.svg";
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 p-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg text-white">
      <h1 className="text-3xl font-semibold mb-8 text-center text-white">
        Recent Transactions
      </h1>
      <Table className="w-full border-separate border-spacing-y-3">
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-gray-300 rounded-lg">
            <TableHead className="py-4 px-6 text-left text-lg font-semibold">
              Name
            </TableHead>
            <TableHead className="py-4 px-6 text-left text-lg font-semibold">
              Amount
            </TableHead>
            <TableHead className="py-4 px-6 text-left text-lg font-semibold">
              Date
            </TableHead>
            <TableHead className="py-4 px-6 text-left text-lg font-semibold">
              Transaction Link
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx, index) => (
            <TableRow
              key={tx._id}
              className={`rounded-lg ${
                index % 2 === 0
                  ? "bg-gradient-to-r from-blue-700 via-purple-700 to-blue-700"
                  : "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700"
              } hover:scale-[1.01] transition-transform duration-300`}
            >
              <TableCell className="py-4 px-6 text-base text-white font-medium">
                {tx.nameofSubscription}
              </TableCell>
              <TableCell className="py-4 px-6 text-base text-blue-300 font-semibold">
                <div className="flex items-center gap-2">
                  <img
                    src={getTokenImage(tx.paymentToken)}
                    alt={tx.paymentToken}
                    className="w-6 h-6"
                  />
                  {(tx.amountinTokens / 10 ** 18).toFixed(2)}
                </div>
              </TableCell>
              <TableCell className="py-4 px-6 text-base text-gray-300">
                {new Date(tx.transationAt).toLocaleDateString()}
              </TableCell>
              <TableCell className="py-4 px-6 text-base">
                <a
                  href={`https://eth-sepolia.blockscout.com/tx/${tx.transactionUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-500 underline transition duration-200"
                >
                  View on Explorer
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
