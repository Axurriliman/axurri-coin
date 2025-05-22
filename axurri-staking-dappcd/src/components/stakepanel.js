import React, { useState } from 'react';
import { connectWallet } from '../utils/wallet';
import useStakingContract from '../hooks/useAxurriStaking';
import { ethers } from 'ethers';

// Contract address must be a string!
const STAKING_CONTRACT_ADDRESS = "0x7DAC708d3914a40DE056A1C9B79486Ed1e53C890"; // <-- Replace with your contract address

const StakePanel = () => {
  const [wallet, setWallet] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const staking = useStakingContract(STAKING_CONTRACT_ADDRESS);

  const connect = async () => {
    const walletData = await connectWallet();
    if (walletData) setWallet(walletData);
  };

  const handleStake = async () => {
    if (!staking) return;
    setLoading(true);
    try {
      const tx = await staking.stake(ethers.parseUnits(amount, 18));
      await tx.wait();
      alert("Staked successfully!");
    } catch (e) {
      console.error(e);
      alert("Stake failed.");
    }
    setLoading(false);
  };

  const handleWithdraw = async () => {
    if (!staking) return;
    setLoading(true);
    try {
      const tx = await staking.withdrawAll();
      await tx.wait();
      alert("Withdraw successful!");
    } catch (e) {
      console.error(e);
      alert("Withdraw failed.");
    }
    setLoading(false);
  };

  const handleClaim = async () => {
    if (!staking) return;
    setLoading(true);
    try {
      const tx = await staking.claimReward();
      await tx.wait();
      alert("Rewards claimed!");
    } catch (e) {
      console.error(e);
      alert("Claim failed.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      {!wallet ? (
        <button onClick={connect}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</p>
          <input
            type="text"
            placeholder="Enter amount to stake"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button onClick={handleStake} disabled={loading}>
            {loading ? "Staking..." : "Stake"}
          </button>
          <button onClick={handleWithdraw} disabled={loading}>
            {loading ? "Withdrawing..." : "Withdraw"}
          </button>
          <button onClick={handleClaim} disabled={loading}>
            {loading ? "Claiming..." : "Claim Reward"}
          </button>
        </>
      )}
    </div>
  );
};

export default StakePanel;