const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying AxurriStaking with account:", deployer.address);

  const Staking = await hre.ethers.getContractFactory("AxurriStaking");

  // ✅ Replace this with your actual DummyToken address
  const tokenAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  const staking = await Staking.deploy(tokenAddress);
  await staking.waitForDeployment();

  console.log("AxurriStaking deployed to:", await staking.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

