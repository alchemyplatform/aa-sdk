// Used by doc-gen to map package names to section names in the docs.yml file
const packageMap = {
  "@account-kit/react": "React",
  "@account-kit/react-native": "React Native",
  "@account-kit/core": "Other JS Frameworks",
  "@account-kit/infra": "Infra",
  "@account-kit/signer": "Signer",
  "@account-kit/smart-contracts": "Smart Contracts",
  "@aa-sdk/core": "Account Abstraction Core",
  "@aa-sdk/ethers": "Account Abstraction Ethers",
} as const;

export default packageMap;
