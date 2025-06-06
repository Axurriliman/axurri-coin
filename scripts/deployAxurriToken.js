const hre = require("hardhat");

async function main() {
  // Get the deployer account (the one associated with your PRIVATE_KEY in .env)
  const [deployer] = await hre.ethers.getSigners();

  console.log(
    "Deploying AxurriToken with the account:",
    deployer.address
  );

  // Get the ContractFactory for your AxurriToken contract
  // The name 'AxurriToken' here must match the contract name in your .sol file.
  const AxurriToken = await hre.ethers.getContractFactory("AxurriToken");

  // Deploy the contract, passing the initialOwner address to its constructor.
  // The 'deployer.address' will be the initial owner.
  const axurriToken = await AxurriToken.deploy(deployer.address);

  // Wait for the contract to be deployed and confirmed on the network
  await axurriToken.waitForDeployment();

  console.log("AxurriToken deployed to address:", await axurriToken.getAddress());
  console.log("Initial owner of AxurriToken:", deployer.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});