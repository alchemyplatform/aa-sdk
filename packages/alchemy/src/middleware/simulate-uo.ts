import {
  deepHexlify,
  resolveProperties,
  type UserOperationStruct,
} from "@alchemy/aa-core";
import type { AlchemyProvider } from "../provider.js";

export const withSimulateUOMiddleware = <P extends AlchemyProvider>(
  provider: P
): P => {
  provider.withSimulateUOMiddleware(async (uoStruct) => {
    const uoSimResult = await provider._simulateUserOperationAssetChanges(
      deepHexlify(await resolveProperties(uoStruct)) as UserOperationStruct
    );

    if (uoSimResult.error) {
      throw new Error(uoSimResult.error.message);
    }

    return uoStruct;
  });
  return provider;
};
