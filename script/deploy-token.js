const hre = require("hardhat");

async function main() {
  const initialOwner = "0xbb3DBB8dcBfb1e03Fdd3DBE8302418F476dbAC94";
  const AxurriToken = await hre.ethers.getContractFactory("AxurriToken");
  const token = await AxurriToken.deploy(initialOwner);

  await token.deployed();

  console.log("AxurriToken deployed to:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});