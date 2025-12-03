// TODO: anything that we want to expose publicly should be exported from `index.ts` files in the subdirectories
// and we shouldn't export * for the sake of tree-shaking
export {
  createSmartWalletClient,
  type SmartWalletClient,
  type SmartWalletClientParams,
} from "../client/index.js";

export type { WalletServerRpcSchemaType } from "@alchemy/wallet-api-types/rpc";

// client actions
export type * from "../client/actions/getCallsStatus.js";
export { getCallsStatus } from "../client/actions/getCallsStatus.js";
export type * from "../client/actions/grantPermissions.js";
export { grantPermissions } from "../client/actions/grantPermissions.js";
export type * from "../client/actions/listAccounts.js";
export { listAccounts } from "../client/actions/listAccounts.js";
export type * from "../client/actions/prepareCalls.js";
export { prepareCalls } from "../client/actions/prepareCalls.js";
export type * from "../client/actions/requestAccount.js";
export { requestAccount } from "../client/actions/requestAccount.js";
export type * from "../client/actions/signSignatureRequest.js";
export { signSignatureRequest } from "../client/actions/signSignatureRequest.js";
export type * from "../client/actions/signPreparedCalls.js";
export { signPreparedCalls } from "../client/actions/signPreparedCalls.js";
export type * from "../client/actions/signMessage.js";
export { signMessage } from "../client/actions/signMessage.js";
export type * from "../client/actions/signTypedData.js";
export { signTypedData } from "../client/actions/signTypedData.js";
export type * from "../client/actions/sendPreparedCalls.js";
export { sendPreparedCalls } from "../client/actions/sendPreparedCalls.js";
export type * from "../client/actions/sendCalls.js";
export { sendCalls } from "../client/actions/sendCalls.js";
export type * from "../client/actions/waitForCallsStatus.js";
export { waitForCallsStatus } from "../client/actions/waitForCallsStatus.js";
export type * from "../client/actions/prepareSign.js";
export { prepareSign } from "../client/actions/prepareSign.js";
export type * from "../client/actions/formatSign.js";
export { formatSign } from "../client/actions/formatSign.js";
