// SPDX-License-Identifier: MIT

const { AbiCoder } = require("ethers");

const tokenAddress = "0xFD6E3e4e9312527a602BDDFCa1be917ea37eef63";
const governance = "0xbb3DBB8dcBfb1e03Fdd3DBE8302418F476dbAC94";

const abiCoder = new AbiCoder();
const encoded = abiCoder.encode(
  ["address", "address"],
  [tokenAddress, governance]
);

console.log("ABI-encoded constructor arguments:");
console.log(encoded.slice(2)); // removes 0x prefix