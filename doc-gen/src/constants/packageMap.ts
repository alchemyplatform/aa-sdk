// Used by doc-gen to map package names to section names in the docs.yml file
const packageMap: Record<string, string> = {
  "account-kit/react": "React",
  "account-kit/react-native": "React Native",
  "account-kit/react-native-signer": "React Native Signer",
  "account-kit/core": "Other JS Frameworks",
  "account-kit/infra": "Infra",
  "account-kit/signer": "Signer",
  "account-kit/smart-contracts": "Smart Contracts",
  "aa-sdk/core": "aa-sdk/core",
  "aa-sdk/ethers": "aa-sdk/ethers",
  "alchemy/aa-infra": "Alchemy Account Abstraction Infrastructure",
  "alchemy/wallet-apis": "Alchemy Smart Wallet APIs",
  "alchemy/common": "Alchemy Common",
  "alchemy/smart-accounts": "Alchemy Smart Accounts",
  "alchemy/wagmi-core": "Alchemy Wagmi Core",
  "alchemy/connectors-web": "Alchemy Wagmi Connector Web",
  "alchemy/signer-web": "Alchemy Web Signer",
  "alchemy/signer": "Alchemy Signer",
};

export default packageMap;
