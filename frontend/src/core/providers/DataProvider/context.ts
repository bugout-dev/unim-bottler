import React, { createContext } from "react";
import { Contract } from "web3-eth-contract";
const erc20abi = require("../../../../abi/erc20.json");
const bottlerAbi = require("../../../../abi/bottlerAbi.json");
import Web3 from "web3";

export interface dataContext {
  erc20Balance: string;
  allowance: string;
  emptyBottles: Array<number>;
  fullBottles: Array<number>;
  contract: Contract;
  bottlerContract: Contract;
  setErc20Balance: React.Dispatch<React.SetStateAction<string>>;
  setAllowance: React.Dispatch<React.SetStateAction<string>>;
  setEmptyBottles: React.Dispatch<React.SetStateAction<number[]>>;
  setFullBottles: React.Dispatch<React.SetStateAction<number[]>>;
}

const web3 = new Web3(null);

const DataContext = createContext<dataContext>({
  erc20Balance: "0",
  allowance: "0",
  emptyBottles: [0, 0, 0],
  fullBottles: [0, 0, 0],
  contract: new web3.eth.Contract(erc20abi, undefined),
  bottlerContract: new web3.eth.Contract(bottlerAbi, undefined),
  setErc20Balance: () => null,
  setAllowance: () => null,
  setEmptyBottles: () => null,
  setFullBottles: () => null,
});

export default DataContext;
