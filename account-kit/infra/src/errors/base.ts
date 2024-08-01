import { BaseError as CoreBaseError } from "@aa-sdk/core";
import { VERSION } from "../version.js";

export abstract class BaseError extends CoreBaseError {
  // This version could be different from the aa-core version so we overwrite this here.
  override version = VERSION;
}
