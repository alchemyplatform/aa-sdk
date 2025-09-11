import type { AuthType } from "../types.js";
import { EmailAuth } from "./EmailAuth.js";
import { ExternalWalletsAuth } from "./InjectedProvidersAuth.js";
import { OAuth } from "./OAuth.js";
import { PasskeyAuth } from "./PasskeyAuth.js";

type AuthSectionProps = {
  authTypes: AuthType[];
};

// This is not used externally
// eslint-disable-next-line jsdoc/require-jsdoc
export const AuthSection = ({ authTypes, ...props }: AuthSectionProps) => {
  return (
    <div className="akui-btn-group w-full" {...props}>
      {authTypes.map((authType, index) => {
        switch (authType.type) {
          case "email":
            return <EmailAuth key={index} {...authType} />;
          case "passkey":
            return <PasskeyAuth key={index} {...authType} />;
          case "social":
            return <OAuth key={index} {...authType} />;
          case "external_wallets":
            return <ExternalWalletsAuth key={index} config={authType} />;
          default:
            throw new Error("Not implemented");
        }
      })}
    </div>
  );
};
