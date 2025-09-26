// TODO: anything that we want to expose publicly should be exported from `index.ts` files in the subdirectories
// and we shouldn't export * for the sake of tree-shaking
export {
  createSmartWalletClient,
  type SmartWalletClient,
  type SmartWalletClientParams,
} from "../client/index.js";

export {
  WalletServerRpcSchema,
  type WalletServerRpcSchemaType,
} from "@alchemy/wallet-api-types/rpc";

// client actions
export { getCallsStatus } from "../client/actions/getCallsStatus.js";
export { grantPermissions } from "../client/actions/grantPermissions.js";
export { listAccounts } from "../client/actions/listAccounts.js";
export { prepareCalls } from "../client/actions/prepareCalls.js";
export { requestAccount } from "../client/actions/requestAccount.js";
export { signSignatureRequest } from "../client/actions/signSignatureRequest.js";
export { signPreparedCalls } from "../client/actions/signPreparedCalls.js";
export { signMessage } from "../client/actions/signMessage.js";
export { signTypedData } from "../client/actions/signTypedData.js";
export { sendPreparedCalls } from "../client/actions/sendPreparedCalls.js";
export { sendCalls } from "../client/actions/sendCalls.js";
export { waitForCallsStatus } from "../client/actions/waitForCallsStatus.js";
export { prepareSign } from "../client/actions/prepareSign.js";
export { formatSign } from "../client/actions/formatSign.js";
