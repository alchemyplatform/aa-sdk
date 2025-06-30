import { BaseError } from "./base.js";

export class InvalidSignedPermit extends BaseError {
  override name = "InvalidSignedPermit";

  constructor(reason: string) {
    super(["Invalid signed permit"].join("\n"), {
      details: [reason, "Please provide a valid signed permit"].join("\n"),
    });
  }
}
