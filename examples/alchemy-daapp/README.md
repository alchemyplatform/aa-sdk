# Alchemy dAApp

## TL;DR
This example daapp contains a web3 dapp that is designed to onboard people onto account abstraction and the Alchemy SDK. It provides a quick starter app for people to get up to speed with these technologies. By creating a Smart Contract Wallet and an NFT!

## Installation
1. Clone the repository:
```bash
git clone https://github.com/alchemyplatform/aa-sdk.git
```
2. Navigate to the examples/alchemy-daapp directory:
```bash
cd aa-sdk/examples/alchemy-daapp
```
3. Install the dependencies:
```bash 
yarn install
```

## Getting Started
1. Update the .env file with your Alchemy API key:
```bash
MUMBAI_ALCHEMY_API_URL=https://polygon-mumbai.g.alchemy.com/v2/<YOUR_API_KEY>
```

2. Update the env.mjs file with your Alchemy API URL:
```javascript
export const alchemyApiKey = "<your-api-key>";
```

3. Update the configs/clientConfigs.ts file with your contract addresses and policy ids:

```typescript
export const serverConfigs: Record<number, ServerConfiguration> = {
  [polygonMumbai.id]: {
    nftContractAddress: "<your-nft-contract-address>",
    simpleAccountFactoryAddress: "<your-simple-account-factory-address>",
    gasManagerPolicyId: "<your-gas-manager-policy-id>",
    chain: polygon,
  },
  // Repeat for other chains as needed
};
```
3. Update the serverConfigs.ts file with your alchemy api keys:
```typescript
const API_URLs: Record<number, string> = {
  [polygonMumbai.id]: env.MUMBAI_ALCHEMY_API_URL,
  // Repeat for other chains as needed...
};
```

5. Start the app:
```bash
yarn dev
```

## How This Works
The `onboarding-controller.ts` file contains the onboarding controller, which handles the onboarding process for new users. The controller uses the Alchemy SDK to create a new account and mint an NFT to it.

In the clientConfigs.ts file, you will find the configuration for the DAApp, including the nft contract address, simple account factory address, gas manager policy id, rpc url, and chain. You'll also find an example NFT contract in `examples/contracts/DAAppNFT`

You can replace the default values with your own contract addresses and policy ids, and add or remove chains as needed.

## Contributing
We welcome contributions to the examples/alchemy-daapp repo! If you would like to contribute, please follow these steps:

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes and commit them
4. Push your changes to your forked repository
5. Submit a pull request to the examples/aa-sdk repo

Please ensure that your code follows our coding standards and that you have added appropriate tests for your changes. We appreciate your contributions and look forward to working with you.
