import { BaseError } from "../errors/base.js";

export class ClientOnlyPropertyError extends BaseError {
  name: string = "ClientOnlyPropertyError";

  constructor(property: string) {
    super(`${property} is only available on the client`);
  }
}
