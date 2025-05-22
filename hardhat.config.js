require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    bscTestnet: {
      url: "https://bsc-testnet.publicnode.com",
      accounts: ["34fba2f5dc20864296a852f2862b7836779c197f65b84453a29d4b8723ea2d6a"],
    },
  },
  etherscan: {
    apiKey: {
      bscTestnet: "ATQ1FFHC6H6NSCY52CQA8DRSXJ6I5ZCUNM" // <-- Replace with your actual API key
    }
  }
};