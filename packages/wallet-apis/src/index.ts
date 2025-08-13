// Actions.
// TODO(v5): revisit exporting the actions themselves.
export type * from "./actions/formatSign.js";
export { formatSign } from "./actions/formatSign.js";
export type * from "./actions/getCallsStatus.js";
export { getCallsStatus } from "./actions/getCallsStatus.js";
export type * from "./actions/grantPermissions.js";
export { grantPermissions } from "./actions/grantPermissions.js";
export type * from "./actions/listAccounts.js";
export { listAccounts } from "./actions/listAccounts.js";
export type * from "./actions/prepareCalls.js";
export { prepareCalls } from "./actions/prepareCalls.js";
export type * from "./actions/prepareSign.js";
export { prepareSign } from "./actions/prepareSign.js";
export type * from "./actions/requestAccount.js";
export { requestAccount } from "./actions/requestAccount.js";
export type * from "./actions/sendCalls.js";
export { sendCalls } from "./actions/sendCalls.js";
export type * from "./actions/sendPreparedCalls.js";
export { sendPreparedCalls } from "./actions/sendPreparedCalls.js";
export type * from "./actions/signMessage.js";
export { signMessage } from "./actions/signMessage.js";
export type * from "./actions/signPreparedCalls.js";
export { signPreparedCalls } from "./actions/signPreparedCalls.js";
export type * from "./actions/signSignatureRequest.js";
export { signSignatureRequest } from "./actions/signSignatureRequest.js";
export type * from "./actions/signTypedData.js";
export { signTypedData } from "./actions/signTypedData.js";
export type * from "./actions/waitForCallsStatus.js";
export { waitForCallsStatus } from "./actions/waitForCallsStatus.js";

// Decorators.
export type * from "./decorators/smartWalletActions.js";
export { smartWalletActions } from "./decorators/smartWalletActions.js";

// RPC Schema.
// TODO(jh): this should be ok for RN since we are only importing types? do we even need to re-export this from here?
export type { WalletServerViemRpcSchema as WalletServerRpcSchema } from "@alchemy/wallet-api-types/rpc";
