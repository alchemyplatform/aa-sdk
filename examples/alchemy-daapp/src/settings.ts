export const IS_PROD_ENVIRONMENT = process.env.NODE_ENV === "production";

export const PORT = getSetting("PORT", 8080);
export const ALCHEMY_API_URL = getSetting("ALCHEMY_API_URL", "");
export const NFT_CONTRACT_ADDRESS = getSetting("NFT_CONTRACT_ADDRESS", "");
export const WALLET_PUBLIC_KEY = getSetting("WALLET_PUBLIC_KEY", "");
export const WALLET_PRIVATE_KEY = getSetting("WALLET_PRIVATE_KEY", "");

function getSetting(key: string, devValue: string): string;
function getSetting(key: string, devValue: number): number;
function getSetting(key: string, devValue: unknown): unknown {
  const value = process.env[key];
  if (value != null) {
    return typeof devValue === "number" ? +value : value;
  }
  if (!IS_PROD_ENVIRONMENT) {
    return devValue;
  }
  throw new Error(`Missing environment variable ${key} in production`);
}
