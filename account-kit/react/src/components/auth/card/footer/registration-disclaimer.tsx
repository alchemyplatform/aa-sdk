import { ls } from "../../../../strings.js";

export const RegistrationDisclaimer = () => (
  <div className="flex flex-row gap-2 justify-center mb-3">
    <span className="text-fg-tertiary text-xs">{ls.login.tosPrefix}</span>
    <a
      className="text-btn-primary text-xs underline"
      href="https://www.alchemy.com/terms-conditions/end-user-terms"
      target="_blank"
      rel="noreferrer noopener"
    >
      {ls.login.tosLink}
    </a>
  </div>
);
