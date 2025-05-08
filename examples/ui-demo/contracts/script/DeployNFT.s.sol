// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";

import {NFT} from "../src/NFT.sol";

contract DeployNFTScript is Script {
    
    function run() public {
        
        string memory name = "Smart Wallets Demo NFT";
        string memory symbol = "SWD";
        string memory baseURI = "https://static.alchemyapi.io/assets/accountkit/smartwallet.png";

        vm.startBroadcast();

        NFT nft = new NFT{ salt: 0 }(name, symbol, baseURI);

        console.log("NFT deployed at address: ", address(nft));

        vm.stopBroadcast();
    }
}