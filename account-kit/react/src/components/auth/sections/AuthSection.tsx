import type { AuthType } from "../types.js";
import { EmailAuth } from "./EmailAuth.js";
import { ExternalWalletsAuth } from "./InjectedProvidersAuth.js";
import { PasskeyAuth } from "./PasskeyAuth.js";
import { SocialAuth } from "./SocialAuth.js";

type AuthSectionProps = {
  authTypes: AuthType[];
};

// This is not used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const AuthSection = ({ authTypes, ...props }: AuthSectionProps) => {
  // TODO: this should also handle the button grouping logic present in the figma designs
  // however, we only support email auth and passkey auth right now so it's not that important
  return (
    <div className="btn-group w-full" {...props}>
      {authTypes.map((authType, index) => {
        switch (authType.type) {
          case "email":
            return <EmailAuth key={index} {...authType} />;
          case "passkey":
            return <PasskeyAuth key={index} {...authType} />;
          case "social":
            return <SocialAuth key={index} {...authType} />;
          case "external_wallets":
            return <ExternalWalletsAuth key={index} />;
          default:
            throw new Error("Not implemented");
        }
      })}
    </div>
  );
};
