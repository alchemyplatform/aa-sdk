// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";

import {ERC20NFT} from "../src/ERC20NFT.sol";

contract DeployERC20NFTScript is Script {
    
    function run() public {
        
        string memory name = "Smart Wallets Demo ERC20 NFT";
        string memory symbol = "SWDE";
        string memory baseURI = "https://static.alchemyapi.io/assets/accountkit/smartwallet.png";
        address usdcTokenAddress = vm.parseAddress("0xCFf7C6dA719408113DFcb5e36182c6d5aa491443"); 

        vm.startBroadcast();

        // Deploying ERC20NFT with the usdcTokenAddress
        ERC20NFT erc20Nft = new ERC20NFT{ salt: 0 }(name, symbol, baseURI, usdcTokenAddress);

        console.log("ERC20NFT deployed at address: ", address(erc20Nft));

        vm.stopBroadcast();
    }
} 