const { ethers } = require("ethers");
const { ChronoFiAddress } = require("./constants");
const abi = require("./contractabi.json");

const getContract = async () => {
  const provider = new ethers.providers.JsonRpcProvider(process.env.INFURA_URL);

  const contract = new ethers.Contract(ChronoFiAddress, abi, provider);
  // console.log(contract.address);

  return contract;
};

module.exports = { getContract };
