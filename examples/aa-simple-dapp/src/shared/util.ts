import {
  MultiOwnerPlugin,
  SessionKeyPlugin,
  TokenReceiverPlugin,
} from "@alchemy/aa-accounts";
import { LocalAccountSigner } from "@alchemy/aa-core";
import { Address, Hex, PrivateKeyAccount } from "viem";
import { generatePrivateKey } from "viem/accounts";

export const getPluginNameFromAddress = (
  address: Address,
  chainId: number
): string | null => {
  switch (address) {
    case MultiOwnerPlugin.meta.addresses[chainId]:
      return MultiOwnerPlugin.meta.name;
    case TokenReceiverPlugin.meta.addresses[chainId]:
      return TokenReceiverPlugin.meta.name;
    case SessionKeyPlugin.meta.addresses[chainId]:
      return SessionKeyPlugin.meta.addresses[chainId];
    default:
      return null;
  }
};

export const createLocalAccount = (): [
  LocalAccountSigner<PrivateKeyAccount>,
  Hex
] => {
  const pkey = generatePrivateKey();
  const signer: LocalAccountSigner<PrivateKeyAccount> =
    LocalAccountSigner.privateKeyToAccountSigner(pkey);
  return [signer, pkey];
};
