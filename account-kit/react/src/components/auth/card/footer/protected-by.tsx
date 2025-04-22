import { AlchemyLogo } from "../../../../icons/alchemy.js";
import { ls } from "../../../../strings.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export const ProtectedBy = () => (
  // eslint-disable-next-line react/jsx-no-target-blank
  <a
    href={`https://www.alchemy.com/?utm_source=auth_modal_footer&utm_medium=sdk&utm_campaign=smart_wallets`}
    target="_blank"
    className="flex flex-row gap-1 items-center h-[14px] text-fg-disabled"
  >
    <span className="text-[11px] pt-[1px]">{ls.protectedBy.title}</span>
    <AlchemyLogo />
  </a>
);
