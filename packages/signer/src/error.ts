import { BaseError } from "@aa-sdk/core";

export class OAuthProvidersError extends BaseError {
  override name = "OAuthProvidersError";
  constructor() {
    super("OAuth providers not found", {
      docsPath: "/react/getting-started",
    });
  }
}

/**
 * This error is thrown when an error occurs during the OAuth login flow.
 */
export class OauthFailedError extends BaseError {
  override name = "OauthFailedError";
}

/**
 * This error is thrown when the OAuth flow is cancelled because the auth popup
 * window was closed.
 */
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
