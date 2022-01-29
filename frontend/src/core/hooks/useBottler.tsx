import React, { useContext, useEffect } from "react";
import Web3Context from "../providers/Web3Provider/context";
import { useToast } from "./";
import { txStatus, web3MethodCall } from "../providers/Web3Provider/context";
import { AbiItem } from "web3-utils";
import { Contract } from "web3-eth-contract";
import useWeb3MEthodCall from "./useWeb3MethodCall";
import { useQuery } from "@chakra-ui/react";
import DataContext from "../providers/DataProvider/context";
const erc20abi = require("../../../abi/erc20.json");
// const bottlerAbi = require("../../../abi/BottlerFacetABI.json");
const bottlerAbi = require("../../../abi/bottlerAbi.json");

export interface BottleType {
  volume: number;
  name: string;
  imageUrl: string;
  poolId: number;
}
export interface BottleTypes {
  small: BottleType;
  medium: BottleType;
  large: BottleType;
}

export const BOTTLE_TYPES: BottleTypes = {
  small: {
    volume: process.env.NODE_ENV !== "development" ? 500 : 250,
    name: "small",
    imageUrl:
      "https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/small_um.png",
    poolId: 0,
  },
  medium: {
    volume: process.env.NODE_ENV !== "development" ? 2500 : 5000,
    name: "medium",
    imageUrl:
      "https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/medium_um.png",
    poolId: 1,
  },
  large: {
    volume: process.env.NODE_ENV !== "development" ? 50000 : 50000,
    name: "large",
    imageUrl:
      "https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/large_um.png",
    poolId: 2,
  },
};

export interface useBottlerReturns {
  erc20Balance: string;
  allowance: string;
  fillBottles: web3MethodCall;
  approveSpendMilk: web3MethodCall;
  emptyBottles: Array<number>;
  fullBottles: Array<number>;
  pourFullBottles: web3MethodCall;
}

export interface useBottlerArgumentsType {
  MilkAddress: string;
  BottlerAddress: string;
  targetChain: any;
}

const useBottler = ({
  MilkAddress,
  BottlerAddress,
  targetChain,
}: useBottlerArgumentsType): useBottlerReturns => {
  const web3Provider = useContext(Web3Context);

  const dataProvider = useContext(DataContext);
  const {
    allowance,
    erc20Balance,
    emptyBottles,
    fullBottles,
    contract,
    bottlerContract,
    setEmptyBottles,
    setErc20Balance,
    setAllowance,
    setFullBottles,
  } = dataProvider;

  React.useEffect(() => {
    contract.options.address = MilkAddress;
  }, [MilkAddress]);

  React.useEffect(() => {
    bottlerContract.options.address = BottlerAddress;
  }, [BottlerAddress]);

  const syncAccountState = () =>
  {
    if (
      web3Provider.web3?.utils.isAddress(web3Provider.account) &&
      web3Provider.chainId === targetChain.chainId
    ) {
      console.log("erc20abi", erc20abi);

      console.log("web3Provider.account", web3Provider.account);
      contract.methods
        .balanceOf(`${web3Provider.account}`)
        .call()
        .then((balance: any) =>
          setErc20Balance(web3Provider.web3.utils.fromWei(balance, "ether"))
        );
      contract.methods
        .allowance(`${web3Provider.account}`, `${BottlerAddress}`)
        .call()
        .then((allowance: any) =>
          setAllowance(web3Provider.web3.utils.fromWei(allowance, "ether"))
        );
      bottlerContract.methods
        .getFullBottleInventory(`${web3Provider.account}`)
        .call()
        .then((bottles: Array<string>) => {
          console.log("got full bottles:", bottles);
          const fullBottlesNum = bottles.map((bottle) => Number(bottle));
          setFullBottles(fullBottlesNum);
        });
      bottlerContract.methods
        .getEmptyBottleInventory(`${web3Provider.account}`)
        .call()
        .then((bottles: Array<string>) => {
          console.log("got empty bottles:", bottles);
          const emptyBottlesNum = bottles.map((bottle) => Number(bottle));
          setEmptyBottles(emptyBottlesNum);
        });
    }
  }
  const fillBottles = useWeb3MEthodCall({
    name: "fillSmallBottles",
    contract: bottlerContract,
    targetChain: targetChain,
    onSuccess: () =>
    {
      toast("Successfully bottled milk!", "success", "Success!!111one");
      syncAccountState();
    },
    onError: (error) =>
    {
      toast(">.< Bottling failed", "error", "FAIL!")
      console.error(error)
    }
  });

  const approveSpendMilk = useWeb3MEthodCall({
    name: "approve",
    contract: contract,
    targetChain: targetChain,
    onSuccess: () =>
    {
      toast("Successfully approved milk!", "success", "Success!")
      syncAccountState();
    },
    onError: (error) =>
    {
      toast(">.< Approval failed", "error", "FAIL!")
      console.error(error)
    }
  });

  const pourFullBottles = useWeb3MEthodCall({
    name: "emptySmallBottles",
    contract: bottlerContract,
    targetChain: targetChain,
    onSuccess: () =>
    {
      toast("Successfully opened bottle(s)!", "success", "Success!")
      syncAccountState();
    },
    onError: (error) =>
    {
      toast(">.< Approval failed", "error", "FAIL!")
      console.error(error)
    }
  });

  const toast = useToast();

  React.useEffect(() => {
   syncAccountState();
  }, [web3Provider.account, web3Provider.chainId]);

  // const pourFullBottles = async (amount: Array<number>) => {
  //   if (
  //     web3Provider.web3?.utils.isAddress(web3Provider.account) &&
  //     web3Provider.chainId === targetChain.chainId
  //   ) {
  //     //Todo pourFullBottles is probably wrong method name
  //     bottlerContract.methods
  //       .pourFullBottles(amount)
  //       .send({ from: web3Provider.account })
  //       .once("receipt", () => {
  //         bottlerContract.methods
  //           .getFullBottleInventory(`${web3Provider.account}`)
  //           .call()
  //           .then((bottles: Array<string>) => {
  //             console.log("got full bottles:", bottles);
  //             const fullBottlesNum = bottles.map((bottle) => Number(bottle));
  //             setFullBottles(fullBottlesNum);
  //           });
  //         bottlerContract.methods
  //           .getEmptyBottleInventory(`${web3Provider.account}`)
  //           .call()
  //           .then((bottles: Array<string>) => {
  //             console.log("got full bottles:", bottles);
  //             const emptyBottlesNum = bottles.map((bottle) => Number(bottle));
  //             setEmptyBottles(emptyBottlesNum);
  //           });
  //       });
  //   }
  // };

  // React.useEffect(() => {
  //   switch (submitStatus) {
  //     case txStatus.ERROR:
  //   }
  // }, submitStatus);

  // const __submitFilllBottlesOrder = ({
  //   amount,
  //   bottle,
  // }: {
  //   amount: number;
  //   bottle: BottleType;
  // }) => {
  //   _submitFilllBottlesOrder.send(amount, bottle.poolId);
  // };

  // const submitFilllBottlesOrder = {
  //   ..._submitFilllBottlesOrder,
  //   send: __submitFilllBottlesOrder,
  // };

  return {
    erc20Balance,
    allowance,
    emptyBottles,
    fullBottles,
    fillBottles,
    approveSpendMilk,
    pourFullBottles,
  };
};

export default useBottler;


