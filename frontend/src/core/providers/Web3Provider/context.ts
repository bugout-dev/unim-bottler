import { createContext } from "react";
import Web3 from "web3";
import { BottleType } from "../../../AppDefintions";

export interface WalletStatesInterface {
  ONBOARD: string;
  CONNECT: string;
  CONNECTED: string;
  WRONG_CHAIN: string;
}
export const WALLET_STATES: WalletStatesInterface = {
  ONBOARD: "Install MetaMask!",
  CONNECT: "Connect with Metamask",
  CONNECTED: "Connected",
  WRONG_CHAIN: "Please select polygon chain in metamask",
};

export interface Web3ProviderInterface {
  web3: Web3 | undefined;
  onConnectWalletClick: VoidFunction;
  buttonText: string;
  WALLET_STATES: WalletStatesInterface;
  account: string;
  erc20Balance: string;
  allowance: string;
  approve: (amount: number) => void;
  emptySmallBottles: (amount: number) => void;
  emptyMediumBottles: (amount: number) => void;
  emptyLargeBottles: (amount: number) => void;
  submit: ({ amount, bottle }: { amount: number; bottle: BottleType }) => void;
  emptyBottles: Array<number>;
  fullBottles: Array<number>;
}

const Web3Context = createContext<Web3ProviderInterface>({
  web3: undefined,
  onConnectWalletClick: () => console.log("not intied"),
  buttonText: "",
  WALLET_STATES: WALLET_STATES,
  account: "",
  erc20Balance: "0",
  allowance: "0",
  approve: () => console.error("method not inited"),
  submit: () => console.error("method not inited"),
  emptySmallBottles: () => console.error("method not inited"),
  emptyMediumBottles: () => console.error("method not inited"),
  emptyLargeBottles: () => console.error("method not inited"),
  emptyBottles: [],
  fullBottles: [],
  // getEmptyBottleInventory: () => [],
});

export default Web3Context;
