# Contracts

Contracts Used for AA SDK

Built using foundry + Alchemy

- Foundry Getting started: https://book.getfoundry.sh/getting-started/installation
- Alchemy Getting started: https://docs.alchemy.com/reference/api-overview

## Index

1. `./DAAppNFT` - A simple NFT based off the tutorial: https://book.getfoundry.sh/tutorials/solmate-nft
2. `./ERC20Token` - A simple ERC20 based off the tutorial: https://www.youtube.com/watch?v=fNMfMxGxeag

## Development

In one of the Subfolder Projects.

1. Set your environment variables by running:

```
export RPC_URL=<Your RPC endpoint>
export PRIVATE_KEY=<Your wallets private key>
```

2. Once set, you can deploy your with Forge by running the below command while and adding the relevant constructor arguments:

```
forge create <contract-name> --rpc-url=$RPC_URL --private-key=$PRIVATE_KEY --constructor-args <name> <symbol>
```

If successfully deployed, you will see the deploying wallet's address, the contract's address as well as the transaction hash printed to your terminal.

3. Calling functions on your contract. For example to send an execution transaction

```
cast send --rpc-url=$RPC_URL <contractAddress>  "exampleMintFunction(address)" <address arg> --private-key=$PRIVATE_KEY
```

Given that you already set your RPC and private key env variables during deployment.

4. Or if you want to execute a call on the contract

```
cast call --rpc-url=$RPC_URL --private-key=$PRIVATE_KEY <contractAddress> "ownerOf(uint256)" <owner arg>
```

5. If you would like you can also run a node locally by using anvil. See more here: https://book.getfoundry.sh/reference/anvil/
