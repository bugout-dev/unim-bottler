import React, { useState } from "react";
import Web3Context, { WALLET_STATES } from "./context";
import Web3 from "web3";
// import * as erc20abi from "../../../../abi/erc20.json"
import { AbiItem } from "web3-utils";
import {
  MILK_ADDRESS,
  BOTTLER_ADDRESS,
  BottleType,
  BOTTLE_TYPES,
} from "../../../AppDefintions";

declare global {
  interface Window {
    ethereum: any;
  }
}
const chains = {
  matic_mumbai: {
    chainId: 80001,
    name: "Matic mumbai",
    rpcs: [
      "https://rpc-mumbai.matic.today",
      "https://matic-mumbai.chainstacklabs.com",
      "https://rpc-mumbai.maticvigil.com",
      "https://matic-testnet-archive-rpc.bwarelabs.com",
    ],
  },
  matic: {
    chainId: 137,
    name: "Matic mainnet",
    rpcs: [
      "https://rpc-mainnet.matic.network",
      "https://matic-mainnet.chainstacklabs.com",
      "https://rpc-mainnet.maticvigil.com",
      "https://rpc-mainnet.matic.quiknode.pro",
      "https://matic-mainnet-full-rpc.bwarelabs.com",
    ],
  },
};

const erc20abi = require("../../../../abi/erc20.json");
const bottlerAbi = require("../../../../abi/bottlerAbi.json");

const targetChain =
  process.env.NODE_ENV === "development" ? chains.matic_mumbai : chains.matic;

const Web3Provider = ({ children }: { children: JSX.Element }) => {
  const [buttonText, setButtonText] = React.useState(WALLET_STATES.ONBOARD);
  const [chaindId, setChaindId] = React.useState<number>();
  const [account, setAccount] = React.useState<string>("");
  const [erc20Balance, setErc20Balance] = React.useState<string>("");
  const [chainId, setChainId] = React.useState<number | void>();
  const [allowance, setAllowance] = React.useState<string>("");
  const [emptyBottles, setEmptyBottles] = React.useState<Array<number>>([]);
  const [fullBottles, setFullBottles] = React.useState<Array<number>>([]);

  const [web3, setWeb3] = React.useState<Web3>();

  const changeChain = async () => {
    try {
      await window.ethereum
        .request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${targetChain.chainId.toString(16)}` }],
        })
        .then(() => web3?.eth.getChainId().then((id) => setChainId(id)));
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: `${targetChain.chainId}`,
                chainName: targetChain.name,
                rpcUrls: targetChain.rpcs,
              },
            ],
          });
        } catch (addError) {
          // handle "add" error
        }
      }
      // handle other "switch" errors
    }
  };

  const ethEnabled = async () => {
    if (window.ethereum) {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const web3 = new Web3(window.ethereum);
      setWeb3(web3);
      return true;
    }
    return false;
  };

  const onConnectWalletClick = () => {
    if (window.ethereum) {
      ethEnabled().then((result) =>
        setButtonText(result ? WALLET_STATES.CONNECTED : WALLET_STATES.CONNECT)
      );
    }
  };

  React.useEffect(() => {
    if (web3?.eth) {
      console.log("getting chain id");
      web3?.eth.getChainId().then((id) => setChainId(id));
    }
  }, [web3?.eth]);

  React.useEffect(() => {
    console.log("chainId,", chainId);
    if (chainId) {
      if (chainId === targetChain.chainId) {
        //we are on matic
        console.log("we are on matic, good! ");
      } else {
        //we are not on matic
        console.log("we are not on matic - request to change", chainId);
        changeChain();
      }
      // console.log('getting chain id')
      // web3?.eth.getChainId().then(id => setChainId(id))
    }
  }, [chainId]);

  React.useEffect(() => {
    if (web3?.eth && chainId === targetChain.chainId) {
      console.log("getting accounts");
      web3?.eth.getAccounts().then((accounts) => setAccount(accounts[0]));
    }
  }, [web3?.eth, chainId]);

  // React.useEffect(() => {
  //   if (web3?.eth && chainId === targetChain.chainId) {
  //     var subscription = web3.eth.subscribe(
  //       "logs",
  //       {
  //         address: MILK_ADDRESS,
  //         from: account,
  //         to: BOTTLER_ADDRESS
  //       },
  //       function (error, result) {
  //         if (!error) console.log(result);
  //       }
  //     );
  //   }
  // }, [web3?.eth, chainId]);

  React.useEffect(() => {
    // const bottlerAddress = "0xE48BC6673B4EEBec6A230f9112Cb2c1ac17bc273";
    if (web3?.utils.isAddress(account) && chainId === targetChain.chainId) {
      console.log("erc20abi", erc20abi);
      const contract = new web3.eth.Contract(erc20abi, MILK_ADDRESS);
      const bottlerContract = new web3.eth.Contract(
        bottlerAbi,
        BOTTLER_ADDRESS
      );
      console.log("account", account);
      contract.methods
        .balanceOf(`${account}`)
        .call()
        .then((balance: any) =>
          setErc20Balance(web3.utils.fromWei(balance, "ether"))
        );
      contract.methods
        .allowance(`${account}`, `${BOTTLER_ADDRESS}`)
        .call()
        .then((allowance: any) =>
          setAllowance(web3.utils.fromWei(allowance, "ether"))
        );
      bottlerContract.methods
        .getFullBottleInventory(`${account}`)
        .call()
        .then((bottles: Array<string>) => {
          console.log("got full bottles:", bottles);
          const fullBottlesNum = bottles.map((bottle) => Number(bottle));
          setFullBottles(fullBottlesNum);
        });
      bottlerContract.methods
        .getEmptyBottleInventory(`${account}`)
        .call()
        .then((bottles: Array<string>) => {
          console.log("got empty bottles:", bottles);
          const emptyBottlesNum = bottles.map((bottle) => Number(bottle));
          setEmptyBottles(emptyBottlesNum);
        });
    }
  }, [account, chainId]);

  const approve = (amount: number) => {
    if (web3?.utils.isAddress(account) && chainId === targetChain.chainId) {
      const contract = new web3.eth.Contract(erc20abi, MILK_ADDRESS);
      const wei = web3.utils.toWei(web3.utils.toBN(amount));
      contract.methods
        .approve(`${BOTTLER_ADDRESS}`, wei)
        .send({ from: account })
        .once("receipt", () =>
          contract.methods
            .allowance(`${account}`, `${BOTTLER_ADDRESS}`)
            .call()
            .then((allowance: any) =>
              setAllowance(web3.utils.fromWei(allowance, "ether"))
            )
        );
    }
  };

  const submit = ({
    amount,
    bottle,
  }: {
    amount: number;
    bottle: BottleType;
  }) => {
    if (web3?.utils.isAddress(account) && chainId === targetChain.chainId) {
      const contract = new web3.eth.Contract(bottlerAbi, BOTTLER_ADDRESS);

      const bottlerContract = new web3.eth.Contract(
        bottlerAbi,
        BOTTLER_ADDRESS
      );
      console.log("bottler address:", BOTTLER_ADDRESS);
      console.log("amount:", amount);
      switch (bottle.name) {
        case BOTTLE_TYPES.small.name:
          contract.methods
            .fillSmallBottles(amount)
            .send({ from: account })
            .once("receipt", () => {
              bottlerContract.methods
                .getFullBottleInventory(`${account}`)
                .call()
                .then((bottles: Array<string>) => {
                  console.log("got full bottles:", bottles);
                  const fullBottlesNum = bottles.map((bottle) =>
                    Number(bottle)
                  );
                  setFullBottles(fullBottlesNum);
                });
              console.log("small success!");
            })
            .once("error", (error: any) => console.log(error));
          break;
        case BOTTLE_TYPES.medium.name:
          contract.methods
            .fillMediumBottles(amount)
            .send({ from: account })
            .once("receipt", () => {
              bottlerContract.methods
                .getFullBottleInventory(`${account}`)
                .call()
                .then((bottles: Array<string>) => {
                  console.log("got full bottles:", bottles);
                  const fullBottlesNum = bottles.map((bottle) =>
                    Number(bottle)
                  );
                  setFullBottles(fullBottlesNum);
                });
              console.log("medium success!");
            })
            .once("error", (error: any) => console.log(error));
          break;
        case BOTTLE_TYPES.large.name:
          contract.methods
            .fillLargeBottles(amount)
            .send({ from: account })
            .once("receipt", () => {
              bottlerContract.methods
                .getFullBottleInventory(`${account}`)
                .call()
                .then((bottles: Array<string>) => {
                  console.log("got full bottles:", bottles);
                  const fullBottlesNum = bottles.map((bottle) =>
                    Number(bottle)
                  );
                  setFullBottles(fullBottlesNum);
                });
              console.log("large success!");
            })
            .once("error", (error: any) => console.log(error));
          break;
        default:
          throw "no such bottle method";
      }
    }
    //   const bottlerAddress = "0xE48BC6673B4EEBec6A230f9112Cb2c1ac17bc273";
    //   if (web3?.utils.isAddress(account) && chainId === targetChain.chainId) {
    //     const contract = new web3.eth.Contract(erc20abi, MILK_ADDRESS);
    //     const wei = web3.utils.toWei(web3.utils.toBN(amount));
    //     contract.methods
    //       .approve(`${bottlerAddress}`, wei)
    //       .send({ from: account })
    //       .then(() =>
    //         contract.methods
    //           .allowance(`${account}`, `${bottlerAddress}`)
    //           .call()
    //           .then((allowance: any) =>
    //             setAllowance(web3.utils.fromWei(allowance, "ether"))
    //           )
    //       );
    //   }
  };

  window?.ethereum?.on("chainChanged", (_chainId: any) =>
    window.location.reload()
  );

  const emptySmallBottles = async (amount: number) => {
    if (web3?.utils.isAddress(account) && chainId === targetChain.chainId) {
      const bottlerContract = new web3.eth.Contract(
        bottlerAbi,
        BOTTLER_ADDRESS
      );

      bottlerContract.methods
        .emptySmallBottles(web3.utils.toBN(amount))
        .send({ from: account })
        .once("receipt", () => {
          bottlerContract.methods
            .getFullBottleInventory(`${account}`)
            .call()
            .then((bottles: Array<string>) => {
              console.log("got full bottles:", bottles);
              const fullBottlesNum = bottles.map((bottle) => Number(bottle));
              setFullBottles(fullBottlesNum);
            });
          bottlerContract.methods
            .getEmptyBottleInventory(`${account}`)
            .call()
            .then((bottles: Array<string>) => {
              console.log("got full bottles:", bottles);
              const emptyBottlesNum = bottles.map((bottle) => Number(bottle));
              setEmptyBottles(emptyBottlesNum);
            });
        });
    }
  };
  const emptyMediumBottles = async (amount: number) => {
    if (web3?.utils.isAddress(account) && chainId === targetChain.chainId) {
      const bottlerContract = new web3.eth.Contract(
        bottlerAbi,
        BOTTLER_ADDRESS
      );

      bottlerContract.methods
        .emptyMediumBottles(web3.utils.toBN(amount))
        .send({ from: account })
        .once("receipt", () => {
          bottlerContract.methods
            .getFullBottleInventory(`${account}`)
            .call()
            .then((bottles: Array<string>) => {
              console.log("got full bottles:", bottles);
              const fullBottlesNum = bottles.map((bottle) => Number(bottle));
              setFullBottles(fullBottlesNum);
            });
          bottlerContract.methods
            .getEmptyBottleInventory(`${account}`)
            .call()
            .then((bottles: Array<string>) => {
              console.log("got full bottles:", bottles);
              const emptyBottlesNum = bottles.map((bottle) => Number(bottle));
              setEmptyBottles(emptyBottlesNum);
            });
        });
    }
  };
  const emptyLargeBottles = async (amount: number) => {
    if (web3?.utils.isAddress(account) && chainId === targetChain.chainId) {
      const bottlerContract = new web3.eth.Contract(
        bottlerAbi,
        BOTTLER_ADDRESS
      );

      bottlerContract.methods
        .emptyLargeBottles(web3.utils.toBN(amount))
        .send({ from: account })
        .once("receipt", () => {
          bottlerContract.methods
            .getFullBottleInventory(`${account}`)
            .call()
            .then((bottles: Array<string>) => {
              console.log("got full bottles:", bottles);
              const fullBottlesNum = bottles.map((bottle) => Number(bottle));
              setFullBottles(fullBottlesNum);
            });
          bottlerContract.methods
            .getEmptyBottleInventory(`${account}`)
            .call()
            .then((bottles: Array<string>) => {
              console.log("got full bottles:", bottles);
              const emptyBottlesNum = bottles.map((bottle) => Number(bottle));
              setEmptyBottles(emptyBottlesNum);
            });
        });
    }
  };

  React.useEffect(() => {
    if (!web3?.eth) {
      if (!window.ethereum) {
        setButtonText(WALLET_STATES.ONBOARD);
      } else {
        setButtonText(WALLET_STATES.CONNECT);
      }
    } else {
      if (chainId === targetChain.chainId) {
        setButtonText(WALLET_STATES.CONNECTED);
      } else {
        setButtonText(WALLET_STATES.WRONG_CHAIN);
      }
    }
  }, [window.ethereum, web3?.eth, chainId]);

  console.log("account:", account);

  return (
    <Web3Context.Provider
      value={{
        web3,
        onConnectWalletClick,
        buttonText,
        WALLET_STATES,
        account,
        erc20Balance,
        allowance,
        approve,
        submit,
        emptyLargeBottles,
        emptyMediumBottles,
        emptySmallBottles,
        emptyBottles,
        fullBottles,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;
