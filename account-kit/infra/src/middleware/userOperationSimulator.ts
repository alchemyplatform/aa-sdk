import {
  deepHexlify,
  resolveProperties,
  type ClientMiddlewareFn,
} from "@alchemy/aa-core";
import type { ClientWithAlchemyMethods } from "../client/types";

export function alchemyUserOperationSimulator<
  C extends ClientWithAlchemyMethods
>(client: C): ClientMiddlewareFn {
  return async (struct, { account }) => {
    const uoSimResult = await client.request({
      method: "alchemy_simulateUserOperationAssetChanges",
      params: [
        deepHexlify(await resolveProperties(struct)),
        account.getEntryPoint().address,
      ],
    });

    if (uoSimResult.error) {
      throw new Error(uoSimResult.error.message);
    }

    return struct;
  };
}
