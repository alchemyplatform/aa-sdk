import {
  deepHexlify,
  resolveProperties,
  type ClientMiddlewareFn,
  type UserOperationStruct,
} from "@alchemy/aa-core";
import type { ClientWithAlchemyMethods } from "../client/types";

export const alchemyUserOperationSimulator: <
  C extends ClientWithAlchemyMethods
>(
  client: C
) => ClientMiddlewareFn =
  (client) =>
  async (struct, { account }) => {
    const uoSimResult = await client.request({
      method: "alchemy_simulateUserOperationAssetChanges",
      params: [
        deepHexlify(await resolveProperties(struct)) as UserOperationStruct,
        account.getEntrypoint(),
      ],
    });

    if (uoSimResult.error) {
      throw new Error(uoSimResult.error.message);
    }

    return struct;
  };
