import { BaseError } from "@aa-sdk/core";

/**
 * Error when Webauthn credentials are not passed to Webauthn Modular Account V2
 */
export class WebauthnCredentialsRequiredError extends BaseError {
  override name = "WebauthnCredentialsRequiredError";
  constructor() {
    super(
      "Webauthn credentials are required to create a Webauthn Modular Account V2",
    );
  }
}

/**
 * Error when a signer is not passed to 7702 version of Modular Account V2
 */
export class SignerRequiredFor7702Error extends BaseError {
  override name = "SignerRequiredFor7702Error";
  constructor() {
    super("A signer is required to create a 7702 Modular Account V2");
  }
}

/**
 * Error when a signer is not passed to default Modular Account V2
 */
export class SignerRequiredForDefaultError extends BaseError {
  override name = "SignerRequiredForDefaultError";
  constructor() {
    super("A signer is required to create a default Modular Account V2");
  }
}
