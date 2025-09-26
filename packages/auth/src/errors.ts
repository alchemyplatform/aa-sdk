import { BaseError } from "@alchemy/common";

/**
 * This error is thrown when no OAuth providers are found for the user during
 * an OAuth login attempt.
 */
export class OAuthProvidersNotFoundError extends BaseError {
  override name = "OAuthProvidersError";
  constructor() {
    super("OAuth providers not found");
  }
}
