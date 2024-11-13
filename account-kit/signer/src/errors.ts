import { BaseError } from "@aa-sdk/core";

export class NotAuthenticatedError extends BaseError {
  override name = "NotAuthenticatedError";
  constructor() {
    super(
      [
        "Signer not authenticated",
        "Please authenticate to use this signer",
      ].join("\n"),
      {
        docsPath: "/signers/alchemy-signer/introduction.html",
      }
    );
  }
}

export class OAuthProvidersError extends BaseError {
  override name = "OAuthProvidersError";
  constructor() {
    super("OAuth providers not found", { docsPath: "/react/getting-started" });
  }
}
