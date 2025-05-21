// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract ERC20Mintable6Decimals is ERC20 {
    uint8 private immutable _decimals;

    constructor(string memory name, string memory symbol)
        ERC20(name, symbol)
    {
        _decimals = 6;
    }

    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function mint(address to, uint256 amount) public {
        require(amount <= type(uint160).max, "Error: max mint amount is uint160 max");
        _mint(to, amount);
    }
}