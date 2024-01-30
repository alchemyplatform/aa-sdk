import type { ConnectionConfig } from "@alchemy/aa-core";
import { BaseError, type Chain } from "viem";
import { version } from "../../package.json";

export class InvalidRpcUrlError extends BaseError {
  override name = "InvalidRpcUrlError";
  override version = version;

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
