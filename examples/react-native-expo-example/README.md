# Account Kit RN Example using Expo

This is a sample repo that used expo to get started and integrates with Account Kit

<img width="434" alt="image" src="https://github.com/alchemyplatform/aa-sdk-rn-expo/assets/4642570/e0dab7bc-f980-46eb-966c-13be7e79bc15">

## How it was made

1. First create a new expo project (we used `yarn`):

```bash
yarn create expo-app --template
```

This project used a `Blank (typescript)` template.

2. Ensure you have the latest version of expo and that the new architecture is enabled

```bash
yarn expo install expo@latest --fix
```

```json
// app.json
{
	"newArchEnabled": true
}
```

3. Install shims for crypto libraries

```bash
yarn expo install node-libs-react-native crypto-browserify stream-browserify react-native-get-random-values
```

4. Add shims to `metro.config.js`:

```javascript
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
config.resolver.extraNodeModules = {
	...config.resolver.extraNodeModules,
	...require("node-libs-react-native"),
	crypto: require.resolve("crypto-browserify"),
	stream: require.resolve("stream-browserify"),
};

module.exports = config;
```

5. Setup Expo Router.

Follow the [expo router docs](https://docs.expo.dev/router/installation/) to setup the router.

```bash
yarn expo install expo-router
```

6. Import global shims in the root layout file: `_layout.tsx`:

```typescript
import "node-libs-react-native/globals.js";
import "react-native-get-random-values";

// rest of _layout.tsx
```

6. Install [Account Kit](https://accountkit.alchemy.com) Packages. At this point you're ready to use the aa-sdk in your project.

```bash
yarn add viem @account-kit/react-native-signer @account-kit/signer @account-kit/smart-contracts @account-kit/infra
```

7. Add a redirect server to handle the auth request. This is needed to redirect users back to the app after clicking the auth magic link in their email.

```bash
yarn add express
```

8. Run the redirect server:

```bash
yarn start:redirect-server
```