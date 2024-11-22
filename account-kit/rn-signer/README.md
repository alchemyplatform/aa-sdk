# @account-kit/react-native-signer (Alpha)

React Native compatible Alchemy signer impl

## ⚠️ Alpha ⚠️

This is an alpha release of the library. Only the **Android** platform is supported at this time.

## Installation

```sh
npm install @account-kit/react-native-signer
```

## Usage

This package requires the `react-native-mmkv` package installed in your project. Check out their [docs](https://github.com/mrousavy/react-native-mmkv) for installation instructions.

#### Deep Linking.

Your app will need to be configured to handle deep linking. Check out the React Native [docs](https://reactnative.dev/docs/linking#enabling-deep-links) for more information.
You will also need a way to trigger the deep link via a http or https url. This can be done in a viarety of ways ranging from universal links to setting up a custom redirect server.

See the [example app](./example) for usage information.

## Contributing

1. Clone the repo
1. run `yarn` in the root of the repo
1. make changes in `rn-signer/src`
1. cd into `account-kit/rn-signer/example`
1. add a `.env` file which contains `API_KEY={alchemy_api_key}`. This API Key needs to correspond to an app that has Embedded Accounts enabled (https://dashboard.alchemy.com/accounts).
1. run `yarn android` to start the example app. You will need to make sure you do the env setup here: https://reactnative.dev/docs/set-up-your-environment to be able to run the app on android

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
