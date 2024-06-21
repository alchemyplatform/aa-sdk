import { useAuthContext } from "../context.js";
import { AddPasskey } from "./add-passkey.js";
import { EoaConnectCard } from "./eoa.js";
import type { AuthCardProps } from "./index.js";
import { LoadingAuth } from "./loading/index.js";
import { MainAuthContent } from "./main.js";
import { PasskeyAdded } from "./passkey-added.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export const Step = (props: AuthCardProps) => {
  const { authStep } = useAuthContext();

  switch (authStep.type) {
    case "email_verify":
    case "passkey_verify":
    case "email_completing":
      return <LoadingAuth config={props} context={authStep} />;
    case "passkey_create":
      return <AddPasskey config={props} />;
    case "passkey_create_success":
      return <PasskeyAdded config={props} />;
    case "eoa_connect":
      return <EoaConnectCard authStep={authStep} />;
    case "complete":
    case "initial":
    default:
      return <MainAuthContent {...props} />;
  }
};
