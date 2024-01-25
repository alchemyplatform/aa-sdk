import {
  deepHexlify,
  resolveProperties,
  type PublicErc4337Client,
  type UserOperationStruct,
} from "@alchemy/aa-core";
import type { ClientMiddlewareFn } from "@alchemy/aa-core/viem";
import type { ClientWithAlchemyMethods } from "../../middleware/client";

export const alchemyUserOperationSimulator: <C extends PublicErc4337Client>(
  client: C
) => ClientMiddlewareFn =
  (client) =>
  async (struct, { account }) => {
    const uoSimResult = await (client as ClientWithAlchemyMethods).request({
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
