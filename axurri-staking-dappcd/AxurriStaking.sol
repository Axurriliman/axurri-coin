// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AxurriToken is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("Axurri", "AXI")
        Ownable(initialOwner)
    {
        _mint(initialOwner, 2_000_000_000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}