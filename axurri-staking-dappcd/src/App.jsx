'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';

import { ConnectButton } from '@rainbow-me/rainbowkit';

import stakingABI from './constant/stakingABI';
import erc20ABI from './constant/erc20ABI'; // Make sure you have this!

const STAKING_ADDRESS = '0x7DAC708d3914a40DE056A1C9B79486Ed1e53C890';
const AXR_TOKEN_ADDRESS = 'your_AXR_token_address_here'; // replace this

export default function StakeApp() {
  const { address } = useAccount();
  const [amount, setAmount] = useState('1000'); // AXR amount to stake (as string)
  const [status, setStatus] = useState('');

  // Read total staked
  const { data: totalStaked } = useReadContract({
    address: STAKING_ADDRESS,
    abi: stakingABI,
    functionName: 'totalStaked',
    watch: true,
  });

  // Approve AXR token
  const { writeContract: approveToken } = useWriteContract();
  const handleApprove = async () => {
    try {
      const value = parseUnits(amount, 18); // assuming AXR uses 18 decimals
      approveToken({
        address: AXR_TOKEN_ADDRESS,
        abi: erc20ABI,
        functionName: 'approve',
        args: [STAKING_ADDRESS, value],
      });
      setStatus('✅ Approved successfully!');
    } catch (err) {
      console.error(err);
      setStatus('❌ Approve failed.');
    }
  };

  // Stake AXR
  const { writeContract: stakeTokens } = useWriteContract();
  const handleStake = async () => {
    try {
      const value = parseUnits(amount, 18);
      stakeTokens({
        address: STAKING_ADDRESS,
        abi: stakingABI,
        functionName: 'stake',
        args: [value],
      });
      setStatus('✅ Stake submitted!');
    } catch (err) {
      console.error(err);
      setStatus('❌ Stake failed.');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Axurri Staking</h2>
      <ConnectButton />
      <div className="mt-4">
        <label className="block text-sm font-medium">Amount to stake:</label>
        <input
          className="w-full border rounded px-2 py-1 my-2"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 1000"
        />
        <button onClick={handleApprove} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
          Approve
        </button>
        <button onClick={handleStake} className="bg-green-600 text-white px-4 py-2 rounded">
          Stake
        </button>
      </div>
      <p className="mt-2 text-sm text-gray-700">{status}</p>
      <div className="mt-4">
        <strong>Total Staked:</strong>{' '}
        {totalStaked ? formatUnits(totalStaked, 18) + ' AXR' : 'Loading...'}
      </div>
    </div>
  );
}
