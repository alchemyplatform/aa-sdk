import { BaseError as ViemBaseError } from "viem";
import { VERSION } from "../version.js";

export class BaseError extends ViemBaseError {
  override name = "AASDKError";
  override version = VERSION;
}
