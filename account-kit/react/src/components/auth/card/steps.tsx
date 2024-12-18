import { useAuthContext } from "../context.js";
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
    case "email_verify":
      return <LoadingEmail />;
    case "passkey_verify":
      return <LoadingPasskeyAuth />;
    case "otp_verify":
      return <LoadingOtp />;
    case "email_completing":
      return <CompletingEmailAuth />;
    case "oauth_completing":
      return <CompletingOAuth />;
    case "passkey_create":
      return <AddPasskey />;
    case "passkey_create_success":
      return <PasskeyAdded />;
    case "eoa_connect":
      return <EoaConnectCard />;
    case "pick_eoa":
      return <EoaPickCard />;
    case "wallet_connect":
      return <WalletConnectCard />;
    case "complete":
    case "initial":
    default:
      return <MainAuthContent />;
  }
};
