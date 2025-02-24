// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Swap} from "../src/Swap.sol";

contract DeploySwapVenueScript is Script {
    
    function run() public {
        vm.startBroadcast();

        Swap swap = new Swap{ salt: 0 }();

        console.log("Swap deployed at address: ", address(swap));

        vm.stopBroadcast();
    }
}
