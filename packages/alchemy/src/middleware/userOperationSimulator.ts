import {
  deepHexlify,
  resolveProperties,
  type ClientMiddlewareFn,
  type EntryPointVersion,
  type UserOperationStruct,
} from "@alchemy/aa-core";
import type { ClientWithAlchemyMethods } from "../client/types";

export function alchemyUserOperationSimulator<
  C extends ClientWithAlchemyMethods<TEntryPointVersion>,
  TEntryPointVersion extends EntryPointVersion
>(client: C): ClientMiddlewareFn {
  return async (struct, { account }) => {
    const uoSimResult = await client.request({
      method: "alchemy_simulateUserOperationAssetChanges",
      params: [
        deepHexlify(
          await resolveProperties(struct)
        ) as UserOperationStruct<TEntryPointVersion>,
        account.getEntryPoint().address,
      ],
    });

    if (uoSimResult.error) {
      throw new Error(uoSimResult.error.message);
    }

    return struct;
  };
}
