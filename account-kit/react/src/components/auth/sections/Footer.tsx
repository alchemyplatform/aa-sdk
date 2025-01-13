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
    case AuthStepType.Initial:
      return <RegistrationDisclaimer />;
    case AuthStepType.EmailVerify:
    case AuthStepType.OtpVerify:
      return <EmailNotReceivedDisclaimer authStep={authStep} />;
    case AuthStepType.PasskeyCreate:
    case AuthStepType.WalletConnect:
    case AuthStepType.PasskeyVerify:
      return <HelpText />;
    case AuthStepType.OauthCompleting:
      return <OAuthContactSupport />;
    case AuthStepType.EmailCompleting:
    case AuthStepType.PasskeyCreateSuccess:
    case AuthStepType.EoaConnect:
    case AuthStepType.PickEoa:
    case AuthStepType.Complete:
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
