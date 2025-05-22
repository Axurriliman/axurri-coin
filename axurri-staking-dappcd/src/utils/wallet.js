import { ethers } from 'ethers';

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      return { provider, signer, address };
    } catch (err) {
      console.error("Wallet connection failed:", err);
      return null;
    }
  } else {
    alert("MetaMask not found. Please install it to use this dApp.");
    return null;
  }
};