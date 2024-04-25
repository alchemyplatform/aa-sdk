import { type ConnectionConfig } from "@alchemy/aa-core";
import { type Chain } from "viem";
import { BaseError } from "./base.js";

/**
 * Description placeholder
 *
 */
export class InvalidRpcUrlError extends BaseError {
  /**
   * @inheritdoc
   */
  override name = "InvalidRpcUrlError";

  /**
   * Creates an instance of InvalidRpcUrlError.
   *
   * @param context - The context parant object containing the chain and connectionConfig fields
   * @param context.chain - The chain object for the rpc url
   * @param context.connectionConfig - The connection config object
   */
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
