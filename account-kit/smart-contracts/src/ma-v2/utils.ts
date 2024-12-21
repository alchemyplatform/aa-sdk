import { concat, toHex, type Hex, type Chain, type Address } from "viem";
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

export type PackUOSignatureParams = {
  // orderedHookData: HookData[];
  validationSignature: Hex;
};

// TODO: direct call validation 1271
export type Pack1271SignatureParams = {
  validationSignature: Hex;
  entityId: number;
};

// Signature packing utility for user operations
export const packUOSignature = ({
  // orderedHookData, TODO: integrate in next iteration of MAv2 sdk
  validationSignature,
}: PackUOSignatureParams): Hex => {
  return concat(["0xFF", "0x00", validationSignature]);
};

// Signature packing utility for 1271 signatures
export const pack1271Signature = ({
  validationSignature,
  entityId,
}: Pack1271SignatureParams): Hex => {
  return concat([
    "0x00",
    toHex(entityId, { size: 4 }),
    "0xFF",
    "0x00", // EOA type signature
    validationSignature,
  ]);
};

export const getDefaultMAV2FactoryAddress = (chain: Chain): Address => {
  switch (chain.id) {
    // TODO: case mekong.id:
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x00000000000017c61b5bEe81050EC8eFc9c6fecd";
  }
};

export const getDefaultSMAV2BytecodeAddress = (chain: Chain): Address => {
  switch (chain.id) {
    // TODO: case mekong.id:
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x000000000000c5A9089039570Dd36455b5C07383";
  }
};

export const getDefaultSMAV2StorageAddress = (chain: Chain): Address => {
  switch (chain.id) {
    // TODO: case mekong.id:
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x0000000000006E2f9d80CaEc0Da6500f005EB25A";
  }
};

export const getDefaultSMAV27702Address = (chain: Chain): Address => {
  switch (chain.id) {
    // TODO: case mekong.id:
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x69007702764179f14F51cdce752f4f775d74E139";
  }
};

export const getDefaultMAV2Address = (chain: Chain): Address => {
  switch (chain.id) {
    // TODO: case mekong.id:
    case sepolia.id:
    case baseSepolia.id:
    case polygon.id:
    case mainnet.id:
    case polygonAmoy.id:
    case optimism.id:
    case optimismSepolia.id:
    case arbitrum.id:
    case arbitrumSepolia.id:
    case base.id:
    default:
      return "0x00000000000002377B26b1EdA7b0BC371C60DD4f";
  }
};
