# Environment Variables Setup

Create a `.env.local` file in the root of this project with the following variables:

```bash
# Privy Configuration
NEXT_PUBLIC_PRIVY_APP_ID=your-privy-app-id
NEXT_PUBLIC_PRIVY_CLIENT_ID=your-privy-client-id

# Alchemy Configuration
NEXT_PUBLIC_ALCHEMY_API_KEY=your-alchemy-api-key
NEXT_PUBLIC_ALCHEMY_POLICY_ID=your-gas-policy-id
```

## Getting Your Keys

### Privy App ID & Client ID

1. Go to [Privy Dashboard](https://dashboard.privy.io/)
2. Create or select an app
3. Copy your **App ID** from the settings
4. Copy your **Client ID** from the API keys section

### Alchemy API Key

1. Go to [Alchemy Dashboard](https://dashboard.alchemy.com/)
2. Create or select an app
3. Copy your API key

### Gas Manager Policy ID

1. Go to [Gas Manager](https://dashboard.alchemy.com/gas-manager)
2. Create a new policy with your desired rules
3. Copy the policy ID
