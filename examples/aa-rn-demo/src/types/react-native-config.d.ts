declare module "react-native-config" {
  export interface NativeConfig {
    NODE_ENV: string;
    ALCHEMY_KEY: string;
    ALCHEMY_RPC_URL: string;
    ALCHEMY_GAS_MANAGER_POLICY_ID: string;
    PRIVATE_KEY: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
