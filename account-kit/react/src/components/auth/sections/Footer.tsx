import { EmailNotReceivedDisclaimer } from "../card/footer/email-not-reveived.js";
import { HelpText } from "../card/footer/help-text.js";
import { PoweredBy } from "../card/footer/poweredby.js";
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
      return <EmailNotReceivedDisclaimer />;
    case "passkey_create":
    case "wallet_connect":
    case "passkey_verify":
      return <HelpText />;
    case "email_completing":
    case "passkey_create_success":
    case "eoa_connect":
    case "pick_eoa":
    case "complete":
      return null;
  }
};
export const Footer = ({ authStep }: FooterProps) => {
  return (
    <div className="bg-bg-surface-subtle p-5 border-bg-surface-inset border-t-[1px]">
      <RenderFooterText authStep={authStep} />
      <div className="flex justify-center">
        <PoweredBy />
      </div>
    </div>
  );
};
