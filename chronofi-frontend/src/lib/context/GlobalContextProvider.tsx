import { ChronoFiAbi } from "@/lib/abi/ChronoFiAbi";
import { createContext, useContext, useEffect, useState } from "react";
import { useAccount, useReadContract } from "wagmi";

export const GlobalContext = createContext(undefined);

export const GlobalContextProvider = ({ children }) => {
  const { address: userAddress, chain, chainId } = useAccount();
  const BervisRequestAddress = "0x841ce48F9446C8E281D3F1444cB859b4A6D0738C";
  const ChronoFiAddress = "0x9d564Dc4e20ab5d3991e2D6FB56E7F34861599df";
  const ChronoToken = "0x303860D21B14B8d2072AF6FDf8345e1d9311630B";
  const PriceOracleAddress = "0x462be78d6dfaCEF20C460edBa701F66935082ca8";
  const schemaId = "0x309";
  const { data: isEarlyUser } = useReadContract({
    address: ChronoFiAddress,
    functionName: "EarlyUser",
    args: [userAddress],
    abi: ChronoFiAbi,
    chainId: chainId,
  });

  /*
  
    [{"name":"name","type":"string"},{"name":"recipient","type":"address"},{"name":"paymentToken","type":"address"},{"name":"amountInUSD","type":"uint256"},{"name":"frequency","type":"uint256"}]

  
  */

  return (
    <GlobalContext.Provider
      value={{
        BervisRequestAddress,
        ChronoFiAddress,
        ChronoToken,
        isEarlyUser,
        PriceOracleAddress,
        schemaId,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
