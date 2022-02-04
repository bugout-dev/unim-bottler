import React, { useContext } from "react";
import Web3Context from "../providers/Web3Provider/context";
import { useToast } from "./";
import { web3MethodCall } from "../providers/Web3Provider/context";
import useWeb3MethodCall from "./useWeb3MethodCall";
import DataContext from "../providers/DataProvider/context";
import BN from "bn.js";
import { useQuery, useQueryClient, UseQueryResult } from "react-query";
import { queryCacheProps } from "./hookCommon";

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
  balanceCache: UseQueryResult<number, any>;
  allowanceCache: UseQueryResult<string, any>;
  fillBottles: web3MethodCall;
  fillEmptyBottles: web3MethodCall;
  approveSpendMilk: web3MethodCall;
  fullBottlesCache: UseQueryResult<Array<number>, any>;
  pourFullBottles: web3MethodCall;
  bottleVolumesCache: UseQueryResult<Array<{ matic: number; bn: BN }>, any>;
  bottlesLeftCache: UseQueryResult<Array<number>, any>;
  emptyBottlesCache: UseQueryResult<Array<number>, any>;
  fullBottlesPricesCache: UseQueryResult<Array<{ matic: number; bn: BN }>, any>;
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
  const { contract, bottlerContract } = dataProvider;

  React.useEffect(() => {
    contract.options.address = MilkAddress;
  }, [MilkAddress, contract.options]);

  React.useEffect(() => {
    bottlerContract.options.address = BottlerAddress;
  }, [BottlerAddress, bottlerContract.options]);

  const _balanceOf = async (): Promise<number> => {
    return contract.methods
      .balanceOf(`${web3Provider.account}`)
      .call()
      .then((balance: any) =>
        Number(web3Provider.web3.utils.fromWei(balance, "ether"))
      );
  };
  const _allowance = async (): Promise<string> => {
    return contract.methods
      .allowance(`${web3Provider.account}`, `${BottlerAddress}`)
      .call()
      .then((balance: any) =>
        web3Provider.web3.utils.fromWei(balance, "ether")
      );
  };
  const _fullBottles = async (): Promise<Array<number>> => {
    return bottlerContract.methods
      .getFullBottleInventory(`${web3Provider.account}`)
      .call()
      .then((bottles: Array<string>) =>
        bottles.map((bottle) => Number(bottle))
      );
  };
  const _emptyBottles = async (): Promise<Array<number>> => {
    return bottlerContract.methods
      .getEmptyBottleInventory(`${web3Provider.account}`)
      .call()
      .then((bottles: Array<string>) =>
        bottles.map((bottle) => Number(bottle))
      );
  };
  const _fullBottlesPrices = async (): Promise<
    Array<{ matic: number; bn: BN }>
  > => {
    return bottlerContract.methods
      .getFullBottlePrices()
      .call()
      .then((prices: Array<string>) => {
        const fullBottlePrices = prices.map((price) => {
          return {
            matic: Number(web3Provider.web3.utils.fromWei(price, "ether")),
            bn: web3Provider.web3.utils.toBN(price),
          };
        });
        return fullBottlePrices;
      });
  };
  const _bottleVolumes = async (): Promise<
    Array<{ matic: number; bn: BN }>
  > => {
    return bottlerContract.methods
      .getVolumeByIndex(0)
      .call()
      .then((smallBottleVolume: string) => {
        let bottleVolumes: Array<string> = [];
        bottleVolumes[0] = smallBottleVolume;
        return bottlerContract.methods
          .getVolumeByIndex(1)
          .call()
          .then((mediumBottleVolume: string) => {
            bottleVolumes[1] = mediumBottleVolume;
            return bottlerContract.methods
              .getVolumeByIndex(2)
              .call()
              .then((largeBottleVolume: string) => {
                bottleVolumes[2] = largeBottleVolume;
                const fullBottleVolumes = bottleVolumes.map(
                  (volume: string) => {
                    const maticValue = web3Provider.web3.utils.fromWei(
                      `${volume}`,
                      "ether"
                    );
                    return {
                      matic: Number(maticValue),
                      bn: web3Provider.web3.utils.toBN(volume),
                    };
                  }
                );
                return fullBottleVolumes;
              });
          });
      });
  };

  const _bottlesLeft = async (): Promise<Array<number>> => {
    return bottlerContract.methods
      .getBottleCapacities()
      .call()
      .then((capacities: Array<string>) => {
        const capacitiesBN = capacities.map((capacity) =>
          web3Provider.web3.utils.toBN(capacity)
        );
        return bottlerContract.methods
          .getEmptyBottleSupplies()
          .call()
          .then((emptyBottlesMinted: Array<string>) => {
            const emptyBottlesMintedBN = emptyBottlesMinted.map(
              (emptyBottlesPoolMinted) =>
                web3Provider.web3.utils.toBN(emptyBottlesPoolMinted)
            );
            return bottlerContract.methods
              .getFullBottleSupplies()
              .call()
              .then((fullBottlesMinted: Array<string>) => {
                const fullBottlesMintedBN = fullBottlesMinted.map(
                  (fullBottlesPoolMinted) =>
                    web3Provider.web3.utils.toBN(fullBottlesPoolMinted)
                );

                const bottlesCapacitiesLeft = capacitiesBN.map(
                  (capacityOfPool, poolIdx) => {
                    var temp = new BN(capacityOfPool);
                    temp = temp.sub(emptyBottlesMintedBN[poolIdx]);
                    temp = temp.sub(fullBottlesMintedBN[poolIdx]);
                    return temp;
                  }
                );
                const num = bottlesCapacitiesLeft.map((bottlesLeft) =>
                  Number(bottlesLeft.toString())
                );
                return num;
              });
          });
      });
  };

  const balanceCache = useQuery(["web3", "balanceOf"], () => _balanceOf(), {
    ...queryCacheProps,
    enabled:
      web3Provider.web3?.utils.isAddress(web3Provider.account) &&
      web3Provider.chainId === targetChain.chainId,
    refetchInterval: 10000,
  });
  const allowanceCache = useQuery(
    ["bottler", "allowance"],
    () => _allowance(),
    {
      ...queryCacheProps,
      enabled:
        web3Provider.web3?.utils.isAddress(web3Provider.account) &&
        web3Provider.chainId === targetChain.chainId,
      refetchInterval: 10000,
    }
  );
  const fullBottlesCache = useQuery(
    ["bottler", "fullBottles"],
    () => _fullBottles(),
    {
      ...queryCacheProps,
      enabled:
        web3Provider.web3?.utils.isAddress(web3Provider.account) &&
        web3Provider.chainId === targetChain.chainId,
      refetchInterval: 10000,
    }
  );
  const emptyBottlesCache = useQuery(
    ["bottler", "emptyBottles"],
    () => _emptyBottles(),
    {
      ...queryCacheProps,
      enabled:
        web3Provider.web3?.utils.isAddress(web3Provider.account) &&
        web3Provider.chainId === targetChain.chainId,
      refetchInterval: 10000,
    }
  );
  const fullBottlesPricesCache = useQuery(
    ["bottler", "fullBottlesPrices"],
    () => _fullBottlesPrices(),
    {
      ...queryCacheProps,
      enabled:
        web3Provider.web3?.utils.isAddress(web3Provider.account) &&
        web3Provider.chainId === targetChain.chainId,
      refetchInterval: 10000,
    }
  );

  const bottleVolumesCache = useQuery(
    ["bottler", "bottleVolumes"],
    () => _bottleVolumes(),
    {
      ...queryCacheProps,
      enabled:
        web3Provider.web3?.utils.isAddress(web3Provider.account) &&
        web3Provider.chainId === targetChain.chainId,
      refetchInterval: 10000,
    }
  );

  const bottlesLeftCache = useQuery(
    ["bottler", "bottlesLeft"],
    () => _bottlesLeft(),
    {
      ...queryCacheProps,
      enabled:
        web3Provider.web3?.utils.isAddress(web3Provider.account) &&
        web3Provider.chainId === targetChain.chainId,
    }
  );

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

  const queryClient = useQueryClient();
  const syncAccountState = React.useCallback(() => {
    const refetchBottlerQueries = async () =>
      await queryClient.refetchQueries(["bottler", "web3"], { active: true });
    if (
      web3Provider.web3?.utils.isAddress(web3Provider.account) &&
      web3Provider.chainId === targetChain.chainId
    ) {
      refetchBottlerQueries();
    }
  }, [
    queryClient,
    web3Provider.chainId,
    web3Provider.account,
    web3Provider.web3.utils,
    targetChain.chainId,
  ]);

  React.useEffect(() => {
    syncAccountState();
  }, [web3Provider.account, web3Provider.chainId, syncAccountState]);

  return {
    balanceCache,
    allowanceCache,
    fullBottlesCache,
    bottleVolumesCache,
    emptyBottlesCache,
    fillEmptyBottles,
    approveSpendMilk,
    pourFullBottles,
    fullBottlesPricesCache,
    bottlesLeftCache,
    fillBottles,
  };
};

export default useBottler;
