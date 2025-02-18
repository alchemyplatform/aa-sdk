## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

-   **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
-   **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
-   **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
-   **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ FOUNDRY_PROFILE=optimized-build forge script script/DeploySwapVenue.s.sol -vv --verify --rpc-url <your_rpc_url> <wallet_option>
```

Make sure to have a verifier API key at the env var `ETHERSCAN_API_KEY` before using.

Otherwise, verify manually with:

```shell

FOUNDRY_PROFILE=optimized-build forge verify-contract 0xB0AEC4c25E8332256A91bBaf169E3C32dfC3C33C Swap --rpc-url <your_rpc_url> --watch

FOUNDRY_PROFILE=optimized-build forge verify-contract 0xCFf7C6dA719408113DFcb5e36182c6d5aa491443 ERC20Mintable --rpc-url <your_rpc_url> --watch --constructor-args $(cast abi-encode "constructor(string,string)" "DemoUSDC" "USDC")

FOUNDRY_PROFILE=optimized-build forge verify-contract 0x0766798566D1f6e2f0b126f7783aaB2CBb81c66f ERC20Mintable --rpc-url <your_rpc_url> --watch --constructor-args $(cast abi-encode "constructor(string,string)" "DemoWETH" "WETH")
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
