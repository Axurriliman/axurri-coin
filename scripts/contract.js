import { ethers } from 'ethers';
import StakingABI from '../abis/AxurriStaking.json'; // Make sure to save your ABI here

const contractAddress = "0x7DAC708d3914a40DE056A1C9B79486Ed1e53C890";

export const getContract = async () => {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, StakingABI.abi, signer);
    return contract;
  } else {
    alert("Please install MetaMask!");
  }
};