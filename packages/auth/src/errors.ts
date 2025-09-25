import { BaseError } from "@aa-sdk/core";

/**
 * This error is thrown when an error occurs during the OAuth login flow.
 */
export class OauthFailedError extends BaseError {
  override name = "OauthFailedError";
}

export class OauthCancelledError extends BaseError {
  override name = "OauthCancelledError";

  /**
   * Constructor for initializing an error indicating that the OAuth flow was
   * cancelled.
   */
  constructor() {
    super("OAuth cancelled");
  }
}

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
