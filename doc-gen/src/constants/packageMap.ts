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
  "alchemy/common": "Alchemy Common",
  "alchemy/smart-accounts": "Alchemy Smart Accounts",
};

export default packageMap;
