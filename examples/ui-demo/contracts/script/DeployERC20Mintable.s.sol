// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {ERC20Mintable} from "../src/ERC20Mintable.sol";

contract DeployERC20MintableScript is Script {
    function run() public {
        // ---- Configuration ----
        string memory name = "Smart Wallets Demo USD Coin";
        string memory symbol = "SWUSDC";
        uint8 decimals_ = 6; // change to 6 if you want USDC-style 6 decimals

        vm.startBroadcast();

        ERC20Mintable token = new ERC20Mintable{salt: 0}(name, symbol, decimals_);

        console.log("ERC20Mintable deployed at address: ", address(token));

        vm.stopBroadcast();
    }
} 