"use client";

import { getSigner, watchSigner, type AlchemySigner } from "@account-kit/core";
import { useSyncExternalStore } from "react";
import { useAlchemyAccountContext } from "./useAlchemyAccountContext.js";
import type { AlchemyWebSigner } from "@account-kit/signer";
import type { RNAlchemySignerType as RNAlchemySigner } from "@account-kit/react-native-signer";

/**
 * [Hook](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/react/src/hooks/useSigner.ts) for accessing the current Alchemy signer within a React component. It uses a synchronous external store for updates.
 * This is a good use case if you want to use the signer as an EOA, giving you direct access to it. The signer returned from `useSigner` just does a `personal_sign` or `eth_signTypedData` without any additional logic, but a smart contract account might have additional logic for creating signatures for 1271 validation so `useSignMessage` or `useSignTypeData` instead.
 *
 * @returns {AlchemySigner | null} The current Alchemy signer or null if none is available. [ref](https://github.com/alchemyplatform/aa-sdk/blob/main/account-kit/signer/src/client/index.ts#L50)
 *
 * @example
 * ```ts twoslash
 * import { useSigner } from "@account-kit/react";
 * import type { AlchemyWebSigner } from "@account-kit/signer";
 *
 * const signer : AlchemyWebSigner | null = useSigner();
 * ```
 */
export const useSigner = <T extends AlchemySigner>(): T | null => {
  const { config } = useAlchemyAccountContext();

  // TODO: figure out how to handle this on the server
  // I think we need a version of the signer that can be run on the server that essentially no-ops or errors
  // for all calls
  return useSyncExternalStore(
    watchSigner(config),
    () => {
      const signer = getSigner(config);

      if (!signer) {
        return null;
      }

      if (isRNAlchemySigner(signer)) {
        return signer as T;
      }

      if (isAlchemyWebSigner(signer)) {
        return signer as T;
      }

      throw new Error("Invalid signer type");
    },
    // We don't want to return null here, should return something of type AlchemySigner
    () => null
  );
};

function isRNAlchemySigner(signer: AlchemySigner): signer is RNAlchemySigner {
  return signer.signerType === "rn-alchemy-signer";
}

function isAlchemyWebSigner(signer: AlchemySigner): signer is AlchemyWebSigner {
  return signer.signerType === "alchemy-signer";
}
