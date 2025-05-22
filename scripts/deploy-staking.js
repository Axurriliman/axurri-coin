async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  const tokenAddress = "0xFD6E3e4e9312527a602BDDFCa1be917ea37eef63";
  const governance = "0xbb3DBB8dcBfb1e03Fdd3DBE8302418F476dbAC94";

  const AxurriStaking = await ethers.getContractFactory("AxurriStaking");
  const staking = await AxurriStaking.deploy(tokenAddress, governance);
  await staking.waitForDeployment();

  console.log("AxurriStaking deployed to:", await staking.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});