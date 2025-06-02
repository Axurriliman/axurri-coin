// src/App.js
import React, { useState } from "react";
import { ethers } from "ethers";
import { useWallet } from "./hooks/useWallet";
import { stakingAbi } from "./staking";

const stakingAddress = "0x7DAC708d3914a40DE056A1C9B79486Ed1e53C890"; // replace if changed

function App() {
  const { connectWallet, account, provider } = useWallet();
  const [amount, setAmount] = useState("");

  const handleApprove = async () => {
    const signer = provider.getSigner();
    const contract = new ethers.Contract(stakingAddress, stakingAbi, signer);
    const tokenAddress = await contract.token(); // optional if you already know it
    const token = new ethers.Contract(tokenAddress, [
      "function approve(address spender, uint256 amount) public returns (bool)",
    ], signer);
    const tx = await token.approve(stakingAddress, ethers.utils.parseEther(amount));
    await tx.wait();
    alert("Token approved!");
  };

  const handleStake = async () => {
    const signer = provider.getSigner();
    const contract = new ethers.Contract(stakingAddress, stakingAbi, signer);
    const tx = await contract.stake(ethers.utils.parseEther(amount));
    await tx.wait();
    alert("Staked successfully!");
  };

  const handleWithdraw = async () => {
    const signer = provider.getSigner();
    const contract = new ethers.Contract(stakingAddress, stakingAbi, signer);
    const tx = await contract.withdraw();
    await tx.wait();
    alert("Withdrawn successfully!");
  };

  return (
    <div className="App" style={{ padding: 24 }}>
      <h2>Axurri Staking DApp</h2>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected Wallet: {account}</p>
          <input
            type="text"
            placeholder="Enter amount to stake"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <div style={{ marginTop: 10 }}>
            <button onClick={handleApprove}>Approve</button>
            <button onClick={handleStake}>Stake</button>
            <button onClick={handleWithdraw}>Withdraw</button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
