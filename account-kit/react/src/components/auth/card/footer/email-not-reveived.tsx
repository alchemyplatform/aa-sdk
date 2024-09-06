import { ls } from "../../../../strings.js";

export const EmailNotReceivedDisclaimer = () => (
  <div className="flex flex-row gap-2 justify-center mb-3">
    <span className="text-fg-tertiary text-xs">
      {ls.loadingEmail.emailNotReceived}
    </span>
    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
    <a href="#" className="text-btn-primary text-xs underline">
      {ls.loadingEmail.resend}
    </a>
  </div>
);
