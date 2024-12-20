import { EmailNotReceivedDisclaimer } from "../card/footer/email-not-reveived.js";
import { HelpText } from "../card/footer/help-text.js";
import { OAuthContactSupport } from "../card/footer/oauth-contact-support.js";
import { ProtectedBy } from "../card/footer/protected-by.js";
import { RegistrationDisclaimer } from "../card/footer/registration-disclaimer.js";
import type { AuthStep } from "../context.js";

type FooterProps = {
  authStep: AuthStep;
};

const RenderFooterText = ({ authStep }: FooterProps) => {
  switch (authStep.type) {
    case "initial":
      return <RegistrationDisclaimer />;
    case "email_verify":
    case "otp_verify":
      return <EmailNotReceivedDisclaimer authStep={authStep} />;
    case "passkey_create":
    case "wallet_connect":
    case "passkey_verify":
      return <HelpText />;
    case "oauth_completing":
      return <OAuthContactSupport />;
    case "email_completing":
    case "otp_completing":
    case "passkey_create_success":
    case "eoa_connect":
    case "pick_eoa":
    case "complete":
      return null;
  }
};
export const Footer = ({ authStep }: FooterProps) => {
  return (
    <div className="p-5 pt-2">
      <RenderFooterText authStep={authStep} />
      <div className="flex justify-center">
        <ProtectedBy />
      </div>
    </div>
  );
};
