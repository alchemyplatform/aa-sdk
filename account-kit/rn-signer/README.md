# @account-kit/react-native-signer

React Native compatible Alchemy signer impl

## Installation

```sh
npm install @account-kit/react-native-signer
```

## Contributing

1. Clone the repo
1. run `yarn` in the root of the repo
1. make changes in `rn-signer/src`
1. cd into `account-kit/rn-signer/example`
1. add a `.env` file which contains `API_KEY={alchemy_api_key}`. This API Key needs to correspond to an app that has Embedded Accounts enabled (https://dashboard.alchemy.com/accounts).
1. run `yarn android` to start the example app. You will need to make sure you do the env setup here: https://reactnative.dev/docs/set-up-your-environment to be able to run the app on android

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
