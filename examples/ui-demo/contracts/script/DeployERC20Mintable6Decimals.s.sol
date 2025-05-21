// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {ERC20Mintable6Decimals} from "../src/ERC20Mintable6Decimals.sol";

contract DeployERC20Mintable6DecimalsScript is Script {
    function run() public {
        // ---- Configuration ----
        string memory name = "Smart Wallets Demo USD Coin";
        string memory symbol = "SWUSDC";

        vm.startBroadcast();

        ERC20Mintable6Decimals token = new ERC20Mintable6Decimals{salt: 0}(name, symbol);

        console.log("ERC20Mintable6Decimals deployed at address: ", address(token));

        vm.stopBroadcast();
    }
} 