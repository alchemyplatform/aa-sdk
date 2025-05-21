// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";

import {NFTUSDCMintable} from "../src/NFTUSDCMintable.sol";

contract DeployNFTUSDCMintableScript is Script {
    
    function run() public {
        
        string memory name = "Smart Wallets Demo NFT USDC Mintable";
        string memory symbol = "SWDNFT";
        string memory baseURI = "https://static.alchemyapi.io/assets/accountkit/capy-beanie.png";
        address usdcTokenAddress = vm.parseAddress("0xf0b7B49aDa5BA5D75e24a54D35C378863b87109f"); 

        vm.startBroadcast();

        // Deploying NFTUSDCMintable with the usdcTokenAddress
        NFTUSDCMintable nftusdc = new NFTUSDCMintable{ salt: 0 }(name, symbol, baseURI, usdcTokenAddress);

        console.log("NFTUSDCMintable deployed at address: ", address(nftusdc));

        vm.stopBroadcast();
    }
} 