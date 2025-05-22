const hre = require("hardhat");

async function main() {
  // 1. Set the initial supply (1,000,000 tokens with 18 decimals)
  const initialSupply = hre.ethers.parseEther("1000000");

  // 2. Load the factory using fully-qualified name
  const TokenFactory = await hre.ethers.getContractFactory(
    "contracts/DummyToken.sol:DummyToken"
  );

  // 3. Deploy the contract
  const token = await TokenFactory.deploy(initialSupply);

  // 4. Wait for deployment to be mined (Ethers v6)
  await token.waitForDeployment();

  console.log("✅ DummyToken deployed to:", token.target);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
