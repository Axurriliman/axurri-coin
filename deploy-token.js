const hre = require("hardhat");

async function main() {
  // Replace this with your desired initial owner address
  const initialOwner = "0xbb3DBB8dcBfb1e03Fdd3DBE8302418F476dbAC94";

  // Compile & get the contract factory
  const AxurriToken = await hre.ethers.getContractFactory("AxurriToken");

  // Deploy the contract
  const token = await AxurriToken.deploy(initialOwner);

  // Wait for deployment to complete
  await token.deployed();

  // Print the deployed address
  console.log("AxurriToken deployed to:", token.address);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
