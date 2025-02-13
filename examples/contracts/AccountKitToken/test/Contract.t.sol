// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Test, console2} from "forge-std/Test.sol";
import {Token} from "../src/Contract.sol";

contract TokenTest is Test {
    Token public token;

    function setUp() public {
        token = new Token();
    }

    function test_mint(address addr) public {
        token.mint(addr);
        assertEq(token.balanceOf(addr), 1.0 * 10 ^ token.decimals());
    }

    function test_name() public {
        assertEq(token.name(), "AccountKitToken");
    }

    function test_symbol() public {
        assertEq(token.symbol(), "ACKT");
    }
}
