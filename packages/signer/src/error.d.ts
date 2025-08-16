import { BaseError } from "@aa-sdk/core";
export declare class OAuthProvidersError extends BaseError {
  name: string;
  constructor();
}
/**
 * This error is thrown when an error occurs during the OAuth login flow.
 */
export declare class OauthFailedError extends BaseError {
  name: string;
}
/**
 * This error is thrown when the OAuth flow is cancelled because the auth popup
 * window was closed.
 */
export declare class OauthCancelledError extends BaseError {
  name: string;
  /**
   * Constructor for initializing an error indicating that the OAuth flow was
   * cancelled.
   */
  constructor();
}
