import { BaseError as ViemBaseError } from "viem";
import { VERSION } from "../version.js";

type BaseErrorParameters = {
  docsPath?: string;
  docsSlug?: string;
  metaMessages?: string[];
} & (
  | {
      cause?: never;
      details?: string;
    }
  | {
      cause: BaseError | Error;
      details?: never;
    }
);

/**
 * A custom error class that extends from `ViemBaseError`. This class allows for error messages to include links to relevant documentation based on provided `docsPath` and `docsSlug` parameters.
 * This is based on on viem's BaseError type (obviously from the import and extend)
 * we want the errors here to point to our docs if we supply a docsPath though
 */
export class BaseError extends ViemBaseError {
  override name = "AASDKError";
  override version = VERSION;

  constructor(shortMessage: string, args: BaseErrorParameters = {}) {
    super(shortMessage, args);

    const docsPath =
      args.cause instanceof BaseError
        ? args.cause.docsPath || args.docsPath
        : args.docsPath;

    this.message = [
      shortMessage || "An error occurred.",
      "",
      ...(args.metaMessages ? [...args.metaMessages, ""] : []),
      ...(docsPath
        ? [
            `Docs: https://www.alchemy.com/docs/wallets${docsPath}${
              args.docsSlug ? `#${args.docsSlug}` : ""
            }`,
          ]
        : []),
      ...(this.details ? [`Details: ${this.details}`] : []),
      `Version: ${this.version}`,
    ].join("\n");
  }
}
