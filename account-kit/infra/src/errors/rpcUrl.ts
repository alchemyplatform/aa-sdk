import { type ConnectionConfig } from "@aa-sdk/core";
import { type Chain } from "viem";
import { BaseError } from "./base.js";

export class InvalidRpcUrlError extends BaseError {
  override name = "InvalidRpcUrlError";

  constructor(context: { chain: Chain; connectionConfig: ConnectionConfig }) {
    super(["RPC Url not provided"].join("\n"), {
      details: [
        "If you are passing in a chain object and only an API key, make sure to use the chain object exported from @aa-sdk/core",
        "Otherwise, pass in an RPC URL directly",
      ].join("\n"),
      metaMessages: [
        `Chain: ${JSON.stringify(context.chain, null, 2)}`,
        `ConnectionConfig: ${JSON.stringify(context.connectionConfig)}`,
      ],
    });
  }
}
