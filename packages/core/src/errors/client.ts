import type { Client } from "viem";
import { BaseError } from "./base.js";

export class IncompatibleClientError extends BaseError {
  override name = "IncompatibleClientError";
  constructor(expectedClient: string, method: string, client: Client) {
    super(
      [
        `Client of type (${client.type}) is not a ${expectedClient}.`,
        `Create one with \`createSmartAccountClient\` first before using \`${method}\``,
      ].join("\n")
    );
  }
}

export class InvalidRpcUrlError extends BaseError {
  override name = "InvalidRpcUrlError";
  constructor(rpcUrl?: string) {
    super(`Invalid RPC URL ${rpcUrl}`);
  }
}

export class ChainNotFoundError extends BaseError {
  override name = "ChainNotFoundError";
  constructor() {
    super("No chain supplied to the client");
  }
}
