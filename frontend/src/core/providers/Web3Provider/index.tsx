import React from "react";
import Web3Context, { WALLET_STATES, txStatus } from "./context";
import Web3 from "web3";

declare global {
  interface Window {
    ethereum: any;
    web3: Web3;
  }
}

// export ChainType
// {

// }
export const chains = {
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

export const web3 = new Web3(null);

export const targetChain =
  process.env.NODE_ENV === "development" ? chains.matic_mumbai : chains.matic;

const Web3Provider = ({ children }: { children: JSX.Element }) => {
  const [buttonText, setButtonText] = React.useState(WALLET_STATES.ONBOARD);
  const [account, setAccount] = React.useState<string>("");
  const [chainId, setChainId] = React.useState<number | void>();

  const [isReady, setIsReady] = React.useState<boolean>(false);
  // const [web3] = React.useState<Web3>(new Web3(null));

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

  const setWeb3ProviderAsWindowEthereum = async () => {
    let wasSetupSuccess = false;
    console.log("setWeb3ProviderAsWindowEthereum");
    await window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then(() => {
        console.log("setting up provider to window.ethereum");
        web3.setProvider(window.ethereum);
        wasSetupSuccess = true;
      });

    if (wasSetupSuccess) {
      console.log("testing if web3 is using provider without errors");
      await web3.eth.net.isListening().then(
        (isListening) => (wasSetupSuccess = isListening),
        () => (wasSetupSuccess = false)
      );
    }
    return wasSetupSuccess;
  };

  const onConnectWalletClick = () => {
    if (window.ethereum) {
      console.log(
        "onConnectWalletClick, window.ethereum found -> connecting wallet"
      );
      setWeb3ProviderAsWindowEthereum().then((result) => {
        if (result)
          console.log("setup was successfull, now is legit to call web3.eth");
        else
          console.log("setup failed, should go in fallback mode immediately");
        setButtonText(result ? WALLET_STATES.CONNECTED : WALLET_STATES.CONNECT);
      });
    }
  };

  React.useEffect(() => {
    if (web3.currentProvider) {
      console.log("web3 is getting chain id");
      web3?.eth.getChainId().then((id) => setChainId(id));
    }
  }, [web3.currentProvider]);

  React.useEffect(() => {
    if (web3.currentProvider) {
      console.log(
        "Checking that",
        chainId,
        "corresponds to selected target chain id:",
        targetChain.chainId
      );
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
    }
  }, [chainId, web3.currentProvider]);

  React.useEffect(() => {
    const condition = chainId === targetChain.chainId && web3.currentProvider;
    console.log("trying to call accounts useeffect", condition, chainId);
    if (chainId === targetChain.chainId && web3.currentProvider) {
      console.log("web3 is getting users account[0]");
      web3.eth.getAccounts().then((accounts) => setAccount(accounts[0]));
    }
  }, [chainId, web3.currentProvider]);

  window?.ethereum?.on("chainChanged", (_chainId: any) =>
    window.location.reload()
  );

  React.useEffect(() => {
    console.log("updating wallet button status");
    if (!web3.currentProvider) {
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
  }, [window.ethereum, web3.currentProvider, chainId]);

  // React.useEffect(())

  console.log("returning from web3provider. Account:", web3.currentProvider);

  return (
    <Web3Context.Provider
      value={{
        web3: web3,
        onConnectWalletClick,
        buttonText,
        WALLET_STATES,
        account,
        chainId,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Provider;
