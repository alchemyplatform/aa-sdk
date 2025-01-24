import { BaseError } from "@aa-sdk/core";

export class InAppBrowserUnavailableError extends BaseError {
  override name = "InAppBrowserUnavailableError";
  constructor() {
    super(
      "In-App Browser is not available. Please authenticate with a different method."
    );
  }
}
