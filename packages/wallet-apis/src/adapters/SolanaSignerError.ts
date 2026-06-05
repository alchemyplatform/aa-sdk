import { BaseError } from "@alchemy/common";

export class SolanaSignerError extends BaseError {
  override name = "SolanaSignerError";
}
