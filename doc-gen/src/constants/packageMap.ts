// Used by doc-gen to map package names to section names in the docs.yml file
const packageMap: Record<string, string> = {
  // account-kit packages (legacy structure in /account-kit folder)
  "account-kit/react": "React",
  "account-kit/react-native": "React Native",
  "account-kit/react-native-signer": "React Native Signer",
  "account-kit/core": "Other JS Frameworks",
  "account-kit/infra": "Infra",
  "account-kit/signer": "Signer",
  "account-kit/smart-contracts": "Smart Contracts",
  // aa-sdk packages (legacy structure in /aa-sdk folder)
  "aa-sdk/core": "aa-sdk/core",
  "aa-sdk/ethers": "aa-sdk/ethers",
  // alchemy packages (new structure in /packages folder)
  "alchemy/aa-infra": "Alchemy Account Abstraction Infrastructure",
  "alchemy/auth": "Alchemy Auth",
  "alchemy/auth-react-native": "Alchemy Auth React Native",
  "alchemy/auth-web": "Alchemy Web Auth",
  "alchemy/common": "Alchemy Common",
  "alchemy/connectors-web": "Alchemy Wagmi Connector Web",
  "alchemy/react": "Alchemy React",
  "alchemy/sdk": "Alchemy SDK",
  "alchemy/smart-accounts": "Alchemy Smart Accounts",
  "alchemy/wagmi-core": "Alchemy Wagmi Core",
  "alchemy/wallet-apis": "Alchemy Smart Wallet APIs",
};

export default packageMap;
