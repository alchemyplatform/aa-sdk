import { ls } from "../../../../strings.js";

export const RegistrationDisclaimer = () => (
  <div className="flex flex-row gap-2 justify-center mb-3">
    <span className="text-fg-tertiary text-xs">{ls.login.tosPrefix}</span>
    {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
    <a href="#" className="text-btn-primary text-xs underline">
      {ls.login.tosLink}
    </a>
  </div>
);
