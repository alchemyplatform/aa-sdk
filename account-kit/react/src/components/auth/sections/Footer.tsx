import { EmailNotReceivedDisclaimer } from "../card/footer/email-not-reveived.js";
import { HelpText } from "../card/footer/help-text.js";
import { OAuthContactSupport } from "../card/footer/oauth-contact-support.js";
import { ProtectedBy } from "../card/footer/protected-by.js";
import { RegistrationDisclaimer } from "../card/footer/registration-disclaimer.js";
import { AuthStepType, type AuthStep } from "../context.js";

type FooterProps = {
  authStep: AuthStep;
};

const RenderFooterText = ({ authStep }: FooterProps) => {
  switch (authStep.type) {
    case AuthStepType.initial:
      return <RegistrationDisclaimer />;
    case AuthStepType.email_verify:
    case AuthStepType.otp_verify:
      return <EmailNotReceivedDisclaimer authStep={authStep} />;
    case AuthStepType.passkey_create:
    case AuthStepType.wallet_connect:
    case AuthStepType.passkey_verify:
      return <HelpText />;
    case AuthStepType.oauth_completing:
      return <OAuthContactSupport />;
    case AuthStepType.email_completing:
    case AuthStepType.passkey_create_success:
    case AuthStepType.eoa_connect:
    case AuthStepType.pick_eoa:
    case AuthStepType.complete:
    default:
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
