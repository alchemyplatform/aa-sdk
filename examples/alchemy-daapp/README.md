# Alchemy dAApp

This example dapp contains an account abstraction-enabled web3 application designed to onboard people onto the Alchemy Account Abstraction SDK. It provides a quick starter for developers to use these technologies, by creating a Smart Contract Wallet and minting it an NFT!

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
1. Update the .env file with your Alchemy API key(s):
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

4. Update the serverConfigs.ts file with your alchemy API keys:
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
The [`onboarding-controller.ts`](https://github.com/alchemyplatform/aa-sdk/blob/master/examples/alchemy-daapp/src/surfaces/onboarding/OnboardingController.ts) file contains the onboarding controller, which handles the onboarding process for new users. The controller uses the Alchemy SDK to create a new account and mint an NFT.

In the [`clientConfigs.ts`](https://github.com/alchemyplatform/aa-sdk/blob/main/examples/alchemy-daapp/src/configs/clientConfigs.ts) file, you will find the configuration for the DAApp, including the nft contract address, simple account factory address, gas manager policy id, rpc url, and chain. You'll also find an example NFT contract in [`examples/contracts/DAAppNFT`](https://github.com/alchemyplatform/aa-sdk/tree/main/examples/contracts/DAAppNFT)

You can replace the default values with your contract addresses and policy ids and add or remove chains as needed.

## Contributing
We welcome contributions to the examples/alchemy-daapp repo! If you would like to contribute, please follow these steps:

1. Clone the repository
2. Create a new branch for your changes
3. Make your changes and commit them
4. Push your changes to the repository
5. Submit a pull request to the examples/aa-SDK repo

Please ensure that your code follows our coding standards and that you have added appropriate tests for your changes. We appreciate your contributions and look forward to working with you.

**This repository follows an MIT license**
