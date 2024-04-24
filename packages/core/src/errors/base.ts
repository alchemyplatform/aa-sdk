import { BaseError as ViemBaseError } from "viem";
import { VERSION } from "../version.js";

/**
 * Description placeholder
 *
 */
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
 * Description
 * This is based on on viem's BaseError type.
 * Errors here point to aa-sdk docs with docsPath if supplied.
 *
 */
export class BaseError extends ViemBaseError {
  /**
   * @inheritdoc
   */
  override name = "AASDKError";
  /**
   * @inheritdoc
   */
  override version = VERSION;

  /**
   * Creates an instance of BaseError.
   *
   * @param shortMessage - A short error message to be displayed
   * @param [args] - BaseErrorParameters arguments
   */
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
            `Docs: https://accountkit.alchemy.com${docsPath}${
              args.docsSlug ? `#${args.docsSlug}` : ""
            }`,
          ]
        : []),
      ...(this.details ? [`Details: ${this.details}`] : []),
      `Version: ${this.version}`,
    ].join("\n");
  }
}
