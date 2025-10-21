export {
  sendEmailOtp,
  type SendEmailOtpParameters,
  type SendEmailOtpReturnType,
} from "./actions/sendEmailOtp.js";

export {
  sendSmsOtp,
  type SendSmsOtpParameters,
  type SendSmsOtpReturnType,
} from "./actions/sendSmsOtp.js";

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
  sendVerificationCode,
  type SendVerificationCodeParameters,
  type SendVerificationCodeReturnType,
} from "./actions/sendVerificationCode.js";

export {
  updateEmail,
  type UpdateEmailParameters,
  type UpdateEmailReturnType,
} from "./actions/updateEmail.js";

export {
  updatePhoneNumber,
  type UpdatePhoneNumberParameters,
  type UpdatePhoneNumberReturnType,
} from "./actions/updatePhoneNumber.js";

export {
  getUser,
  type GetUserParameters,
  type GetUserReturnType,
} from "./actions/getUser.js";

export {
  watchUser,
  type WatchUserParameters,
  type WatchUserReturnType,
} from "./actions/watchUser.js";

export {
  getAuthSession,
  type GetAuthSessionParameters,
  type GetAuthSessionReturnType,
} from "./actions/getAuthSession.js";

export {
  getAuthClient,
  type GetAuthClientParameters,
  type GetAuthClientReturnType,
} from "./actions/getAuthClient.js";

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
