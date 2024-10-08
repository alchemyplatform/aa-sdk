import { useAuthContext } from "../context.js";
import { AddPasskey } from "./add-passkey.js";
import { EoaConnectCard, EoaPickCard, WalletConnectCard } from "./eoa.js";
import { LoadingEmail, CompletingEmailAuth } from "./loading/email.js";
import { CompletingOAuth } from "./loading/oauth.js";
import { LoadingPasskeyAuth } from "./loading/passkey.js";
import { MainAuthContent } from "./main.js";
import { PasskeyAdded } from "./passkey-added.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export const Step = () => {
  const { authStep } = useAuthContext();
  switch (authStep.type) {
    case "email_verify":
      return <LoadingEmail authStep={authStep} />;
    case "passkey_verify":
      return <LoadingPasskeyAuth authStep={authStep} />;
    case "email_completing":
      return <CompletingEmailAuth authStep={authStep} />;
    case "oauth_completing":
      return <CompletingOAuth authStep={authStep} />;
    case "passkey_create":
      return <AddPasskey authStep={authStep} />;
    case "passkey_create_success":
      return <PasskeyAdded />;
    case "eoa_connect":
      return <EoaConnectCard authStep={authStep} />;
    case "pick_eoa":
      return <EoaPickCard />;
    case "wallet_connect":
      return <WalletConnectCard authStep={authStep} />;
    case "complete":
    case "initial":
    default:
      return <MainAuthContent authStep={authStep} />;
  }
};
