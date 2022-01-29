import React, { useContext } from "react";
import DataContext from "./context";
import { Contract } from "web3-eth-contract";
import Web3Context from "../Web3Provider/context";
const erc20abi = require("../../../../abi/erc20.json");
// const bottlerAbi = require("../../../../abi/BottlerFacetABI.json");
const bottlerAbi = require("../../../../abi/bottlerAbi.json");

const DataProvider = ({ children }: { children: JSX.Element }) => {
  const { web3 } = useContext(Web3Context);
  const [erc20Balance, setErc20Balance] = React.useState<string>("0");
  const [allowance, setAllowance] = React.useState<string>("0");
  const [emptyBottles, setEmptyBottles] = React.useState<Array<number>>([]);
  const [fullBottles, setFullBottles] = React.useState<Array<number>>([]);
  const [contract] = React.useState<Contract>(
    new web3.eth.Contract(erc20abi, undefined)
  );
  const [bottlerContract] = React.useState<Contract>(
    new web3.eth.Contract(bottlerAbi, undefined)
  );

  return (
    <DataContext.Provider
      value={{
        erc20Balance,
        setErc20Balance,
        allowance,
        setAllowance,
        emptyBottles,
        setEmptyBottles,
        fullBottles,
        setFullBottles,
        contract,
        bottlerContract,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataProvider;
