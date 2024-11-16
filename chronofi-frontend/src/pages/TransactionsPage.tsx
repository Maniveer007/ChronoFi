import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Transactions() {
  const transactions = [
    {
      id: 1,
      name: "Monthly Rent",
      amount: "1 ETH",
      date: "2023-04-01",
      link: "https://etherscan.io/tx/0x123...",
    },
    {
      id: 2,
      name: "Subscription",
      amount: "0.1 ETH",
      date: "2023-04-15",
      link: "https://etherscan.io/tx/0x456...",
    },
    {
      id: 3,
      name: "Utility Bill",
      amount: "0.5 ETH",
      date: "2023-04-30",
      link: "https://etherscan.io/tx/0x789...",
    },
  ];

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
              key={tx.id}
              className={`rounded-lg ${
                index % 2 === 0
                  ? "bg-gradient-to-r from-blue-700 via-purple-700 to-blue-700"
                  : "bg-gradient-to-r from-gray-700 via-gray-800 to-gray-700"
              } hover:scale-[1.01] transition-transform duration-300`}
            >
              <TableCell className="py-4 px-6 text-base text-white font-medium">
                {tx.name}
              </TableCell>
              <TableCell className="py-4 px-6 text-base text-blue-300 font-semibold">
                {tx.amount}
              </TableCell>
              <TableCell className="py-4 px-6 text-base text-gray-300">
                {tx.date}
              </TableCell>
              <TableCell className="py-4 px-6 text-base">
                <a
                  href={tx.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 hover:text-blue-500 underline transition duration-200"
                >
                  View on Etherscan
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
