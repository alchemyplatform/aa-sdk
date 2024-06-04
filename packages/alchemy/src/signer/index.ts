export type * from "./signer.js";
export {
  /** @deprecated use AlchemyWebSigner instead */
  AlchemySigner,
  AlchemySigner as AlchemyWebSigner,
} from "./signer.js";

export type * from "./types.js";
export { AlchemySignerStatus } from "./types.js";

export { cookieStorage } from "../config/utils/cookies.js";
export { BaseSignerClient } from "./client/base.js";
export {
  /** @deprecated use AlchemySignerWebClient */
  AlchemySignerWebClient as AlchemySignerClient,
  AlchemySignerWebClient,
} from "./client/index.js";
export type * from "./client/types.js";
