import { BaseError } from "./base.js";

export class IncompatibleClientError extends BaseError {
  override name = "IncompatibleClientError";
  constructor(expectedClient: string, method: string) {
    super(
      [
        `Client is not a ${expectedClient}.`,
        `Create one with \`createSmartAccountClient\` first before using \`${method}\``,
      ].join("\n")
    );
  }
}
