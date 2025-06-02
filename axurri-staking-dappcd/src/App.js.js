import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { stakingABI } from "./constants/stakingABI"; 
import { tokenABI } from "./constants/tokenABI";    

const stakingAddress = "0x7DAC708d3914a40DE056A1C9B79486Ed1e53C890";
const tokenAddress =  "0xFD6E3e4e9312527a602BDDFCa1be917ea37eef63"; 

function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [amount, setAmount] = useState("");
  const [tokenContract, setTokenContract] = useState(null);
  const [stakingContract, setStakingContract] = useState(null);
  const [tokenBalance, setTokenBalance] = useState("0");
  const [stakedBalance, setStakedBalance] = useState("0");
  const [rewards, setRewards] = useState("0");

  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const connectWallet = async () => {
      if (window.ethereum) {
        try {
          const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
          await web3Provider.send("eth_requestAccounts", []);
          const signer = web3Provider.getSigner();
          const address = await signer.getAddress();
          setProvider(web3Provider);
          setSigner(signer);
          setAccount(address);

          const token = new ethers.Contract(tokenAddress, tokenABI, signer);
          const staking = new ethers.Contract(stakingAddress, stakingABI, signer);
          setTokenContract(token);
          setStakingContract(staking);
        } catch (err) {
          console.error("Wallet connection failed:", err);
        }
      } else {
        alert("Please install MetaMask!");
      }
    };
    connectWallet();
  }, []);

  const fetchBalances = async () => {
    if (!stakingContract || !account || !tokenContract) return;
    setIsRefreshing(true);
    try {
      const staked = await stakingContract.balanceOf(account);
      const reward = await stakingContract.earned(account);
      const tokenBal = await tokenContract.balanceOf(account);
      setStakedBalance(ethers.utils.formatEther(staked));
      setRewards(ethers.utils.formatEther(reward));
      setTokenBalance(ethers.utils.formatEther(tokenBal));
    } catch (err) {
      console.error("Error fetching balances:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [stakingContract, account]);

  const handleApprove = async () => {
    if (!tokenContract || !amount) {
      setError("Please enter an amount to approve.");
      return;
    }
    setError(null);
    setIsApproving(true);
    try {
      const tx = await tokenContract.approve(stakingAddress, ethers.utils.parseEther(amount));
      await tx.wait();
      alert("Approved successfully");
    } catch (err) {
      console.error("Approve failed:", err);
      setError(`Approve failed: ${err.reason || err.message}`);
    } finally {
      setIsApproving(false);
    }
  };

  const handleStake = async () => {
    if (!stakingContract || !amount) {
      setError("Enter amount to stake.");
      return;
    }
    setError(null);
    setIsStaking(true);
    try {
      const tx = await stakingContract.stake(ethers.utils.parseEther(amount));
      await tx.wait();
      alert("Staked successfully");
      fetchBalances();
    } catch (err) {
      console.error("Stake failed:", err);
      setError(`Stake failed: ${err.reason || err.message}`);
    } finally {
      setIsStaking(false);
    }
  };

  const handleWithdraw = async () => {
    if (!stakingContract || !amount) {
      setError("Enter amount to withdraw.");
      return;
    }
    setError(null);
    setIsWithdrawing(true);
    try {
      const tx = await stakingContract.withdraw(ethers.utils.parseEther(amount));
      await tx.wait();
      alert("Withdrawn successfully");
      fetchBalances();
    } catch (err) {
      console.error("Withdraw failed:", err);
      setError(`Withdraw failed: ${err.reason || err.message}`);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleClaimReward = async () => {
    if (!stakingContract) return;
    setError(null);
    setIsClaiming(true);
    try {
      const tx = await stakingContract.claimReward();
      await tx.wait();
      alert("Rewards claimed successfully");
      fetchBalances();
    } catch (err) {
      console.error("Claim reward failed:", err);
      setError(`Claim reward failed: ${err.reason || err.message}`);
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Axurri Staking dApp (AXR)</h1>

      {account ? (
        <p className="mb-2">Connected: {account}</p>
      ) : (
        <p className="text-red-500">Not connected</p>
      )}

      {error && <p className="text-red-500 mb-2">{error}</p>}

      <p>Staked Balance: {stakedBalance} AXR</p>
      <p>Rewards: {rewards} AXR</p>
      <p>Your Token Balance: {tokenBalance} AXR</p>

      <button
        onClick={fetchBalances}
        className="mt-2 mb-4 bg-gray-600 text-white px-3 py-1 rounded"
        disabled={isRefreshing}
      >
        {isRefreshing ? "Refreshing..." : "🔄 Refresh Balances"}
      </button>

      <input
        type="text"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="border p-2 rounded w-full mb-4"
      />

      <div className="space-x-2">
        <button
          onClick={handleApprove}
          className="bg-yellow-500 text-white px-4 py-2 rounded"
          disabled={isApproving || !amount}
        >
          {isApproving ? "Approving..." : "Approve"}
        </button>
        <button
          onClick={handleStake}
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={isStaking || !amount}
        >
          {isStaking ? "Staking..." : "Stake"}
        </button>
        <button
          onClick={handleWithdraw}
          className="bg-red-500 text-white px-4 py-2 rounded"
          disabled={isWithdrawing || !amount}
        >
          {isWithdrawing ? "Withdrawing..." : "Withdraw"}
        </button>
        <button
          onClick={handleClaimReward}
          className="bg-green-600 text-white px-4 py-2 rounded"
          disabled={isClaiming}
        >
          {isClaiming ? "Claiming..." : "Claim Rewards"}
        </button>
      </div>
    </div>
  );
}

export default App;
