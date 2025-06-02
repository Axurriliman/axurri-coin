import { useState } from "react";
import { ethers } from "ethers";

const WalletConnect = ({ onConnect }) => {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      onConnect(accounts[0]);
    }
  };

  return (
    <button onClick={connectWallet}>
      {account ? `Connected: ${account.substring(0, 6)}...` : "Connect Wallet"}
    </button>
  );
};

export default WalletConnect;
