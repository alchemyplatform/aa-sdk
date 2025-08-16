import {
  isHex,
  toHex,
  type Hex,
  type SignableMessage,
  bytesToHex,
  type TypedDataDefinition,
  getTypesForEIP712Domain,
} from "viem";
import { TypedDataDefinition as WalletServerTypedDataDefinition } from "@alchemy/wallet-api-types";

export const castToHex = (val: string | number | bigint | Hex): Hex => {
  if (isHex(val)) {
    return val;
  }
  return toHex(val);
};

export const signableMessageToJsonSafe = (
  message: SignableMessage,
): string | { raw: Hex } => {
  if (typeof message === "string") {
    return message;
  }
  return {
    raw:
      typeof message.raw === "string" ? message.raw : bytesToHex(message.raw),
  };
};

// Purposefully not using `formatTypedData` from the wallet server types pkg
// here, since that would require typebox at runtime (which breaks RN).
export const typedDataToJsonSafe = ({
  domain,
  primaryType,
  message,
  types,
}: TypedDataDefinition): WalletServerTypedDataDefinition => {
  return {
    domain: {
      ...domain,
      chainId:
        typeof domain?.chainId === "bigint"
          ? Number(domain.chainId)
          : domain?.chainId,
    },
    types: {
      ...Object.fromEntries(
        Object.entries(types).map(([key, value]) => [
          key,
          value ? [...value] : [],
        ]),
      ),
      EIP712Domain: [...getTypesForEIP712Domain({ domain })],
    },
    primaryType,
    message: JSON.parse(
      JSON.stringify(message, (_, v) => (typeof v === "bigint" ? toHex(v) : v)),
    ),
  };
};
