export {
  sendEmailOtp,
  type SendEmailOtpParameters,
  type SendEmailOtpReturnType,
} from "./actions/sendEmailOtp.js";

export {
  submitOtpCode,
  type SubmitOtpCodeParameters,
  type SubmitOtpCodeReturnType,
} from "./actions/submitOtpCode.js";

export {
  loginWithOauth,
  type LoginWithOauthParameters,
  type LoginWithOauthReturnType,
} from "./actions/loginWithOauth.js";

export {
  handleOauthRedirect,
  type HandleOauthRedirectParameters,
  type HandleOauthRedirectReturnType,
} from "./actions/handleOauthRedirect.js";

export {
  prepareSwap,
  type PrepareSwapParameters,
  type PrepareSwapReturnType,
} from "./actions/prepareSwap.js";

export {
  prepareCalls,
  type PrepareCallsParameters,
  type PrepareCallsReturnType,
} from "./actions/prepareCalls.js";

export {
  sendPreparedCalls,
  type SendPreparedCallsParameters,
  type SendPreparedCallsReturnType,
} from "./actions/sendPreparedCalls.js";

export {
  createConfig,
  type AlchemyConfig,
  type AlchemyCreateConfigParameters,
} from "./createConfig.js";

export {
  ALCHEMY_AUTH_CONNECTOR_TYPE,
  ALCHEMY_SMART_WALLET_CONNECTOR_TYPE,
} from "./utils/resolveAuthConnector.js";
