# Alchemy React Native Mobile Account Abstraction Dapp

This is a simple React Native cross-platform (iOS & Android) mobile application that leverages account abstraction via the Alchemy aa-sdk, allowing users to mint an ERC-721 Token to an SCA without needing to have an EOA wallet or incur any gas fees.

In addition, this demo utilizes Alchemy JS SDK for the basic wallet asset tracking functionalities on the app.

# Getting Started

## Quick Start

### Install & Build

```sh
git clone https://github.com/alchemyplatform/aa-sdk;
yarn install;
cd examples/aa-rn-demo;
npx pod-install;
```

### Run Locally

```sh
yarn start;
# Then, on another terminal session:
npx react-native run-ios/android;
```

### Android local.properties (Android Only)

- `npm i`
- `cd android && mkdir local.properties`
- `nano local.properties`

#### Example of MacOS Android SDK Path

Make sure that set your right path of Android **SDK**

##### MacOS / Linux

Replace your machine name instead of `username`

```
sdk.dir=/Users/username/Library/Android/sdk
```

##### Windows

Replace your machine name instead of `username`

```
sdk.dir=/Users/username/Library/Android/sdk
```

- `cd .. & react-native run-ios/android`

## License

AA RN Demo is available under the MIT license. See the LICENSE file for more info.
