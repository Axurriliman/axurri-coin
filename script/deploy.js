const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying AxurriToken with the account:", deployer.address);

  const AxurriToken = await hre.ethers.getContractFactory("AxurriToken");
  const token = await AxurriToken.deploy(deployer.address);

  await token.deployed();

  console.log("AxurriToken deployed to address:", token.address);

  console.log("Waiting for 6 block confirmations before verifying...");
  await token.deployTransaction.wait(6); // Wait for block confirmations (BscScan needs this)

  try {
    await hre.run("verify:verify", {
      address: token.address,
      constructorArguments: [deployer.address],
    });
    console.log("Contract verified successfully!");
  } catch (err) {
    console.error("Verification failed:", err);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
