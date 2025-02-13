import { ls } from "../../../../strings.js";

export const RegistrationDisclaimer = () => (
  <div className="flex flex-row gap-1 justify-center mb-2 sm:flex-col sm:items-center lg:flex-row">
    <span className="text-fg-tertiary text-xs">{ls.login.tosPrefix}</span>
    <a
      className="text-btn-primary text-xs underline whitespace-nowrap"
      href="https://www.alchemy.com/terms-conditions/end-user-terms"
      target="_blank"
      rel="noreferrer noopener"
    >
      {ls.login.tosLink}
    </a>
  </div>
);
