// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

error NonExistentTokenURI();
error USDCTransferFailed();

contract NFTUSDCMintable is ERC721 {

    using Strings for uint256;
    string public baseURI;
    uint256 public currentTokenId;
    IERC20 public usdcToken;
    uint256 public mintPrice = 1 * 10**6;

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseURI,
        address _usdcTokenAddress
    ) ERC721(_name, _symbol) {
        baseURI = _baseURI;
        usdcToken = IERC20(_usdcTokenAddress);
    }

    function mintTo(address recipient) public returns (uint256) {
        if (!usdcToken.transferFrom(msg.sender, address(this), mintPrice)) {
            revert USDCTransferFailed();
        }

        uint256 newTokenId = ++currentTokenId;
        _safeMint(recipient, newTokenId);
        return newTokenId;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        if (ownerOf(tokenId) == address(0)) {
            revert NonExistentTokenURI();
        }
        return baseURI;
    }
}
