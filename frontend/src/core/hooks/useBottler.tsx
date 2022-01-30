import React, { useContext } from "react";
import Web3Context from "../providers/Web3Provider/context";
import { useToast } from "./";
import { web3MethodCall } from "../providers/Web3Provider/context";
import useWeb3MethodCall from "./useWeb3MethodCall";
import DataContext from "../providers/DataProvider/context";
import BN from "bn.js";

export interface BottleType {
  name: string;
  imageUrl: string;
  emptyImageURL: string;
  // TODO(zomglings): Rename to poolIndex. It is too easy to confuse poolId as referring to the Terminus
  // pool ID.
  poolId: number;
  terminusPoolId: number;
}
export interface BottleTypes {
  small: BottleType;
  medium: BottleType;
  large: BottleType;
}

export const BOTTLE_TYPES: BottleTypes = {
  small: {
    name: "small",
    emptyImageURL:
      "https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/small_empty_bottle.png",
    imageUrl:
      "https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/small_um.png",
    poolId: 0,
    terminusPoolId: 5,
  },
  medium: {
    name: "medium",
    emptyImageURL:
      "https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/medium_empty_bottle.png",
    imageUrl:
      "https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/medium_um.png",
    poolId: 1,
    terminusPoolId: 6,
  },
  large: {
    name: "large",
    emptyImageURL:
      "https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/large_empty_bottle.png",
    imageUrl:
      "https://s3.amazonaws.com/static.simiotics.com/unicorn_bazaar/large_um.png",
    poolId: 2,
    terminusPoolId: 7,
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
  bottleVolumes: Array<number>;
  fullBottlesPrices: Array<number>;
  fullBottlePricesBN: Array<BN>;
  bottlesLeftToMint: Array<BN>;
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
    fullBottlesPrices,
    bottleVolumes,
    fullBottlePricesBN,
    bottlesLeftToMint,
    setEmptyBottles,
    setErc20Balance,
    setAllowance,
    setFullBottles,
    setFullBottlePrices,
    setBottleVolumes,
    setFullBottlePricesBN,
    setBottlesLeftToMint,
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
      bottlerContract.methods
        .getFullBottlePrices()
        .call()
        .then((prices: Array<string>) => {
          console.log("got bottle prices:", prices);
          const fullBottlePricesMatic = prices.map((price) =>
            Number(web3Provider.web3.utils.fromWei(price, "ether"))
          );
          console.log(
            "got bottle prices fullBottlePricesMatic:",
            fullBottlePricesMatic
          );
          setFullBottlePrices(fullBottlePricesMatic);
          const fullBottlePriceBN = prices.map((price) =>
            web3Provider.web3.utils.toBN(price)
          );
          setFullBottlePricesBN(fullBottlePriceBN);
        });
      let bottleVolumes: Array<string> = [];
      bottlerContract.methods
        .getVolumeByIndex(0)
        .call()
        .then((smallBottleVolume: string) => {
          bottleVolumes[0] = smallBottleVolume;
          bottlerContract.methods
            .getVolumeByIndex(1)
            .call()
            .then((smallBottleVolume: string) => {
              bottleVolumes[1] = smallBottleVolume;
              bottlerContract.methods
                .getVolumeByIndex(2)
                .call()
                .then((smallBottleVolume: string) => {
                  bottleVolumes[2] = smallBottleVolume;
                  const _bottleVolumes = bottleVolumes.map((volume) =>
                    Number(web3Provider.web3.utils.fromWei(volume, "ether"))
                  );
                  console.log("_bottleVolumes", _bottleVolumes);
                  setBottleVolumes(_bottleVolumes);
                });
            });
        });

      bottlerContract.methods
        .getBottleCapacities()
        .call()
        .then((capacities: Array<string>) => {
          const capacitiesBN = capacities.map((capacity) =>
            web3Provider.web3.utils.toBN(capacity)
          );
          bottlerContract.methods
            .getEmptyBottleSupplies()
            .call()
            .then((emptyBottlesMinted: Array<string>) => {
              const emptyBottlesMintedBN = emptyBottlesMinted.map(
                (emptyBottlesPoolMinted) =>
                  web3Provider.web3.utils.toBN(emptyBottlesPoolMinted)
              );
              bottlerContract.methods
                .getFullBottleSupplies()
                .call()
                .then((fullBottlesMinted: Array<string>) => {
                  const fullBottlesMintedBN = fullBottlesMinted.map(
                    (fullBottlesPoolMinted) =>
                      web3Provider.web3.utils.toBN(fullBottlesPoolMinted)
                  );

                  const bottlesLeft = capacitiesBN.map(
                    (capacityOfPool, poolIdx) => {
                      var temp = new BN(capacityOfPool);
                      temp = temp.sub(emptyBottlesMintedBN[poolIdx]);
                      temp = temp.sub(fullBottlesMintedBN[poolIdx]);
                      return temp;
                    }
                  );
                  setBottlesLeftToMint(bottlesLeft);
                });
            });
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
    setBottleVolumes,
    setFullBottlePrices,
    setFullBottlePricesBN,
    setBottlesLeftToMint,
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

  console.log(
    "bottles left to mint: ",
    bottlesLeftToMint.map((bottlesLeftToMintBN) =>
      bottlesLeftToMintBN.toString()
    )
  );

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
    fullBottlesPrices,
    bottleVolumes,
    fullBottlePricesBN,
    bottlesLeftToMint,
  };
};

export default useBottler;
