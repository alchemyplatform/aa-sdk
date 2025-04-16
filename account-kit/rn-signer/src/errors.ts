import { BaseError } from "@aa-sdk/core";
import type { MfaFactor } from "@account-kit/signer";

export class InAppBrowserUnavailableError extends BaseError {
  override name = "InAppBrowserUnavailableError";
  constructor() {
    super(
      "In-App Browser is not available. Please authenticate with a different method."
    );
  }
}

export class MfaRequiredError extends BaseError {
  override name = "MfaRequiredError";
  public multiFactors: MfaFactor[];

  constructor(multiFactors: MfaFactor[]) {
    super("MFA is required for this user");
    this.multiFactors = multiFactors;
  }
}
