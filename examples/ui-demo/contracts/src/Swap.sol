// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC20Mintable} from "./ERC20Mintable.sol";

contract Swap {
    ERC20Mintable public usdc;
    ERC20Mintable public weth;

    constructor() {
        usdc = new ERC20Mintable("DemoUSDC", "USDC");
        usdc.mint(address(this), type(uint160).max);

        weth = new ERC20Mintable("DemoWETH", "WETH");
        weth.mint(address(this), type(uint160).max);
    }

    function mint(uint amount1, uint amount2) external {
        usdc.mint(msg.sender, amount1);
        weth.mint(msg.sender, amount2);
    }

    function swapUSDCtoWETH(uint amountIn, uint amountOut) external {
        require(amountOut <= 10 ether, "Max 10 eth swap at a time");
        usdc.transferFrom(msg.sender, address(this), amountIn);
        weth.transfer(msg.sender, amountOut);
    }

    function swapWETHtoUSDC(uint amountIn, uint amountOut) external {
        require(amountOut <= 100000 ether, "Max 100k USDC swap at a time");
        weth.transferFrom(msg.sender, address(this), amountIn);
        usdc.transfer(msg.sender, amountOut);
    }
}