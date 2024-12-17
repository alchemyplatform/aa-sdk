import { concat, type Hex, type Chain, type Address } from "viem";
import {
  arbitrum,
  arbitrumSepolia,
  base,
  baseSepolia,
  mainnet,
  optimism,
  optimismSepolia,
  polygon,
  polygonAmoy,
  sepolia,
} from "@account-kit/infra";

export const DEFAULT_OWNER_ENTITY_ID = 0;

export type PackSignatureParams = {
  // orderedHookData: HookData[];
  validationSignature: Hex;
};

// Signature packing utility
export const packSignature = ({
  // orderedHookData, TO DO: integrate in next iteration of MAv2 sdk
  validationSignature,
}: PackSignatureParams): Hex => {
  return concat(["0xFF", "0x00", validationSignature]);
};

export const addresses = {
  allowlistModule:
    "0xe768abEe3ad779Be1318388fC5D6A6fCf658011B" as `0x${string}`,
  nativeTokenLimitModule:
    "0xbFD077C53ec21f91699cF2DBab5324ea608b4eF0" as `0x${string}`,
  paymasterGuardModule:
    "0x97018B224C969A1992076293f15482FB9982A271" as `0x${string}`,
  singleSignerValidationModule:
    "0x2a42a36ee6DC9E8f75d2f8B5ef621EE8F2bD3156" as `0x${string}`,
  timeRangeModule:
    "0x335a66470B5052DD9F540bD64ca6b7dE205F6f0B" as `0x${string}`,
  webauthnValidationModule:
    "0x52bB58A05659F2fF4bDb57E602824859De11119A" as `0x${string}`,
  executionInstallDelegate:
    "0x8Bf909fEb66EBcC4725f04E70F319791Ec9d9628" as `0x${string}`,
  modularAccountImpl:
    "0x7219030794F2937ff4A322B7CE9a58C070aF08C5" as `0x${string}`,
  semiModularAccountBytecodeImpl:
    "0xc6176BeF7E32224238ef3A2Ee3F9BaCfA801Cc95" as `0x${string}`,
  semiModularAccountStorageOnlyImpl:
    "0x8bD01f353058513fE5968C80585dc0792f56961b" as `0x${string}`,
  accountFactory: "0x52fd2B39bd2a2c411371514114f9a1b3F9Ba3a64" as `0x${string}`,
  accountFactoryOwner:
    "0xDdF32240B4ca3184De7EC8f0D5Aba27dEc8B7A5C" as `0x${string}`,
};
