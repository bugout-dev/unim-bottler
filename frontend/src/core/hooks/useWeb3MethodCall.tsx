import React from "react";
import { Contract } from "web3-eth-contract";
import Web3Context, { txStatus } from "../providers/Web3Provider/context";
import { useContext } from "react";

export interface UseWeb3MethodReturns {
  data: any;
  status: txStatus;
  send: (...args: any[]) => void;
  call: (...args: any[]) => any;
}

export interface UseWeb3MEthod {
  name: string;
  contract: Contract;
  targetChain: any;
  onSuccess?: (receipt?: any) => void;
  onError?: (error?: any) => void;
}

const useWeb3MEthod = ({
  name,
  contract,
  targetChain,
  onSuccess,
  onError,
}: UseWeb3MEthod): UseWeb3MethodReturns => {
  const [status, setStatus] = React.useState<txStatus>(txStatus.READY);
  const [data, setData] = React.useState<any>(undefined);
  const web3Provider = useContext(Web3Context);

  const send = (...args: any) => {
    if (
      web3Provider.web3?.utils.isAddress(web3Provider.account) &&
      web3Provider.chainId === targetChain.chainId
    ) {
      setStatus(txStatus.LOADING);
      console.log("args:", args, name);
      contract.methods[`${name}`](...args)
        .send({ from: web3Provider.account })
        .once("receipt", (receipt: any) => {
          console.log("receipt is:", receipt);
          if (receipt.status) {
            setStatus(txStatus.SUCCESS);
            onSuccess && onSuccess(receipt);
          } else {
            console.error("transaction failed");
            setStatus(txStatus.ERROR);
            onError && onError(receipt);
          }
          console.log("small success!");
        })
        .once("error", (error: any) => {
          console.log("transaction was reverted by evm probably");
          setStatus(txStatus.ERROR);
          console.error("Seems that EVM reverted transaction");
          onError && onError(error);
        });
    }
  };

  const call = (...args: any) => {
    if (
      web3Provider.web3?.utils.isAddress(web3Provider.account) &&
      web3Provider.chainId === targetChain.chainId
    ) {
      setStatus(txStatus.LOADING);
      //todo bottle number enum here in args
      contract.methods[`${name}`](...args).call(
        { from: web3Provider.account },
        (error: any, result: any) => {
          setData(result);
          if (error) {
            onError && onError(error);
          }
        }
      );
    }
  };

  return { data, status, send, call };
};

export default useWeb3MEthod;
