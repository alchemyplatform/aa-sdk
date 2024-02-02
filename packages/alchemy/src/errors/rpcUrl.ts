import { BaseError, type ConnectionConfig } from "@alchemy/aa-core";
import { type Chain } from "viem";
import { VERSION } from "../version.js";

export class InvalidRpcUrlError extends BaseError {
  override name = "InvalidRpcUrlError";
  // This version could be different from the aa-core version so we overwrite this here.
  // TODO: if we add other errors to this package we should make a new base error type for this package
  override version = VERSION;

  constructor(context: { chain: Chain; connectionConfig: ConnectionConfig }) {
    super(["RPC Url not provided"].join("\n"), {
      details: [
        "If you are passing in a chain object and only an API key, make sure to use the chain object exported from @alchemy/aa-core",
        "Otherwise, pass in an RPC URL directly",
      ].join("\n"),
      metaMessages: [
        `Chain: ${JSON.stringify(context.chain, null, 2)}`,
        `ConnectionConfig: ${JSON.stringify(context.connectionConfig)}`,
      ],
    });
  }
}
