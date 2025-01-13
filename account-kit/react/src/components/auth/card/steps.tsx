import { AuthStepType, useAuthContext } from "../context.js";
import { AddPasskey } from "./add-passkey.js";
import { EoaConnectCard, EoaPickCard, WalletConnectCard } from "./eoa.js";
import { CompletingEmailAuth, LoadingEmail } from "./loading/email.js";
import { CompletingOAuth } from "./loading/oauth.js";
import { LoadingPasskeyAuth } from "./loading/passkey.js";
import { MainAuthContent } from "./main.js";
import { PasskeyAdded } from "./passkey-added.js";
import { LoadingOtp } from "./loading/otp.js";

export const Step = () => {
  const { authStep } = useAuthContext();
  switch (authStep.type) {
    case AuthStepType.EmailVerify:
      return <LoadingEmail />;
    case AuthStepType.OtpVerify:
      return <LoadingOtp />;
    case AuthStepType.PasskeyVerify:
      return <LoadingPasskeyAuth />;
    case AuthStepType.EmailCompleting:
      return <CompletingEmailAuth />;
    case AuthStepType.OauthCompleting:
      return <CompletingOAuth />;
    case AuthStepType.PasskeyCreate:
      return <AddPasskey />;
    case AuthStepType.PasskeyCreateSuccess:
      return <PasskeyAdded />;
    case AuthStepType.EoaConnect:
      return <EoaConnectCard />;
    case AuthStepType.PickEoa:
      return <EoaPickCard />;
    case AuthStepType.WalletConnect:
      return <WalletConnectCard />;
    case AuthStepType.Complete:
    case AuthStepType.Initial:
    default:
      return <MainAuthContent />;
  }
};
