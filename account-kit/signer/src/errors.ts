import { BaseError } from "@aa-sdk/core";

export class NotAuthenticatedError extends BaseError {
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
  constructor() {
    super("OAuth providers not found", { docsPath: "/react/getting-started" });
  }
}
