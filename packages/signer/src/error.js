import { BaseError } from "@aa-sdk/core";
export class OAuthProvidersError extends BaseError {
  constructor() {
    super("OAuth providers not found", {
      docsPath: "/react/getting-started",
    });
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "OAuthProvidersError",
    });
  }
}
/**
 * This error is thrown when an error occurs during the OAuth login flow.
 */
export class OauthFailedError extends BaseError {
  constructor() {
    super(...arguments);
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "OauthFailedError",
    });
  }
}
/**
 * This error is thrown when the OAuth flow is cancelled because the auth popup
 * window was closed.
 */
export class OauthCancelledError extends BaseError {
  /**
   * Constructor for initializing an error indicating that the OAuth flow was
   * cancelled.
   */
  constructor() {
    super("OAuth cancelled");
    Object.defineProperty(this, "name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: "OauthCancelledError",
    });
  }
}
//# sourceMappingURL=error.js.map
