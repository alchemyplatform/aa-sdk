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
    case AuthStepType.email_verify:
      return <LoadingEmail />;
    case AuthStepType.otp_verify:
      return <LoadingOtp />;
    case AuthStepType.passkey_verify:
      return <LoadingPasskeyAuth />;
    case AuthStepType.email_completing:
      return <CompletingEmailAuth />;
    case AuthStepType.oauth_completing:
      return <CompletingOAuth />;
    case AuthStepType.passkey_create:
      return <AddPasskey />;
    case AuthStepType.passkey_create_success:
      return <PasskeyAdded />;
    case AuthStepType.eoa_connect:
      return <EoaConnectCard />;
    case AuthStepType.pick_eoa:
      return <EoaPickCard />;
    case AuthStepType.wallet_connect:
      return <WalletConnectCard />;
    case AuthStepType.complete:
    case AuthStepType.initial:
    default:
      return <MainAuthContent />;
  }
};
