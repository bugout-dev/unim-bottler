import React, { useContext } from "react";
import Web3Context from "../providers/Web3Provider/context";
import { useToast } from "./";
import { web3MethodCall } from "../providers/Web3Provider/context";
import useWeb3MethodCall from "./useWeb3MethodCall";
import DataContext from "../providers/DataProvider/context";

export interface BottleType {
  volume: number;
  name: string;
  imageUrl: string;
  // TODO(zomglings): Rename to poolIndex. It is too easy to confuse poolId as referring to the Terminus
  // pool ID.
  poolId: number;
  weiPrice: string;
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
    weiPrice: "100000000000000000",
  },
  medium: {
    volume: process.env.NODE_ENV !== "development" ? 2500 : 5000,
    name: "medium",
    imageUrl:
      "https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/medium_um.png",
    poolId: 1,
    weiPrice: "400000000000000000",
  },
  large: {
    volume: process.env.NODE_ENV !== "development" ? 50000 : 50000,
    name: "large",
    imageUrl:
      "https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/large_um.png",
    poolId: 2,
    weiPrice: "2400000000000000000",
  },
};

export interface useBottlerReturns {
  erc20Balance: string;
  allowance: string;
  fillBottles: web3MethodCall;
  fillEmptyBottles: web3MethodCall;
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
  }, [MilkAddress, contract.options]);

  React.useEffect(() => {
    bottlerContract.options.address = BottlerAddress;
  }, [BottlerAddress, bottlerContract.options]);

  const syncAccountState = React.useCallback(() => {
    if (
      web3Provider.web3?.utils.isAddress(web3Provider.account) &&
      web3Provider.chainId === targetChain.chainId
    ) {
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
  }, [
    BottlerAddress,
    bottlerContract,
    contract.methods,
    setAllowance,
    setEmptyBottles,
    setErc20Balance,
    setFullBottles,
    targetChain,
    web3Provider.account,
    web3Provider.web3.utils,
    web3Provider.chainId,
  ]);
  const fillBottles = useWeb3MethodCall({
    name: "fillBottles",
    contract: bottlerContract,
    targetChain: targetChain,
    onSuccess: () => {
      toast("Successfully bottled milk!", "success", "Success!!111one");
      syncAccountState();
    },
    onError: (error) => {
      toast(">.< Bottling failed", "error", "FAIL!");
      console.error(error);
    },
  });

  const fillEmptyBottles = useWeb3MethodCall({
    name: "fillEmptyBottles",
    contract: bottlerContract,
    targetChain: targetChain,
    onSuccess: () => {
      toast("Successfully bottled milk!", "success", "Success!!111one");
      syncAccountState();
    },
    onError: (error) => {
      toast(">.< Bottling failed", "error", "FAIL!");
      console.error(error);
    },
  });

  const approveSpendMilk = useWeb3MethodCall({
    name: "approve",
    contract: contract,
    targetChain: targetChain,
    onSuccess: () => {
      toast("Successfully approved milk!", "success", "Success!");
      syncAccountState();
    },
    onError: (error) => {
      toast(">.< Approval failed", "error", "FAIL!");
      console.error(error);
    },
  });

  const pourFullBottles = useWeb3MethodCall({
    name: "emptyBottles",
    contract: bottlerContract,
    targetChain: targetChain,
    onSuccess: () => {
      toast("Successfully opened bottle(s)!", "success", "Success!");
      syncAccountState();
    },
    onError: (error) => {
      toast(">.< Approval failed", "error", "FAIL!");
      console.error(error);
    },
  });

  const toast = useToast();

  React.useEffect(() => {
    syncAccountState();
  }, [web3Provider.account, web3Provider.chainId, syncAccountState]);

  return {
    erc20Balance,
    allowance,
    emptyBottles,
    fullBottles,
    fillBottles,
    fillEmptyBottles,
    approveSpendMilk,
    pourFullBottles,
  };
};

export default useBottler;
