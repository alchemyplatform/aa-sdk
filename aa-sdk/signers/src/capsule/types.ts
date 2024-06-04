import type { Environment } from "@usecapsule/web-sdk";
import type { WalletClientConfig } from "viem";

// copied since Capsule doesn't export this type
interface ConstructorOpts {
  useStorageOverrides?: boolean;
  disableWorkers?: boolean;
  offloadMPCComputationURL?: string;
  useLocalFiles?: boolean;
  localStorageGetItemOverride?: (key: string) => Promise<string | null>;
  localStorageSetItemOverride?: (key: string, value: string) => Promise<void>;
  sessionStorageGetItemOverride?: (key: string) => Promise<string | null>;
  sessionStorageSetItemOverride?: (key: string, value: string) => Promise<void>;
  sessionStorageRemoveItemOverride?: (key: string) => Promise<void>;
  clearStorageOverride?: () => Promise<void>;
  portalBackgroundColor?: string;
  portalPrimaryButtonColor?: string;
  portalTextColor?: string;
  portalPrimaryButtonTextColor?: string;
  useDKLSForCreation?: boolean;
}

// copied since Capsule doesn't export this type
enum WalletScheme {
  CGGMP = "CGGMP",
  DKLS = "DKLS",
}

// copied since Capsule doesn't export this type
interface Wallet {
  id: string;
  signer: string;
  address?: string;
  publicKey?: string;
  scheme?: WalletScheme;
}

// copied since Capsule doesn't export this type
interface ViemClientOpts {
  noAccount?: boolean;
}

export interface CapsuleConfig {
  env: Environment;
  walletConfig: WalletClientConfig;
  apiKey?: string | undefined;
  opts?: ConstructorOpts | undefined;
  viemClientOpts?: ViemClientOpts;
}

export interface CapsuleAuthenticationParams {}

export type CapsuleUserInfo = Record<string, Wallet>;
