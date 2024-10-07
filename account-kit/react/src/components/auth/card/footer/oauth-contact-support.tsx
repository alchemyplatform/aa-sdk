import { type AuthStep } from "../../context.js";

type OAuthContactSupportProps = {
  authStep: Extract<AuthStep, { type: "oauth_completing" }>;
};

export const OAuthContactSupport = ({ authStep }: OAuthContactSupportProps) => {
  return (
    authStep.supportUrl && (
      <div className="flex flex-row gap-1 justify-center mb-3">
        <span className="text-fg-tertiary text-xs">Having trouble?</span>
        <a
          className="text-btn-primary text-xs underline"
          href={authStep.supportUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          Contact Support
        </a>
      </div>
    )
  );
};
