import {
  deepHexlify,
  resolveProperties,
  type UserOperationStruct,
} from "@alchemy/aa-core";
import type { AlchemyProvider } from "../provider/index.js";
import type { ClientWithAlchemyMethods } from "./client.js";

export const withAlchemyUserOpSimulation = <P extends AlchemyProvider>(
  provider: P
): P => {
  provider.withSimulateUOMiddleware(async (uoStruct) => {
    const uoSimResult = await (
      provider.rpcClient as ClientWithAlchemyMethods
    ).request({
      method: "alchemy_simulateUserOperationAssetChanges",
      params: [
        deepHexlify(await resolveProperties(uoStruct)) as UserOperationStruct,
        provider.getEntryPointAddress(),
      ],
    });

    if (uoSimResult.error) {
      throw new Error(uoSimResult.error.message);
    }

    return uoStruct;
  });
  return provider;
};
