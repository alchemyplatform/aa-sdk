import type { Chain } from "viem";
import { BaseError } from "../errors/base.js";

export class ClientOnlyPropertyError extends BaseError {
  name: string = "ClientOnlyPropertyError";

  constructor(property: string) {
    super(`${property} is only available on the client`);
  }
}

export class ChainNotFoundError extends BaseError {
  name: string = "ChainNotFoundError";

  constructor(chain: Chain) {
    super(`Chain (${chain.name}) not found in connections config object`, {
      docsPath: "https://accountkit.alchemy.com/react/createConfig",
    });
  }
}
