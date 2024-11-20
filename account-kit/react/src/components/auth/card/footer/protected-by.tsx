import { AlchemyLogo } from "../../../../icons/alchemy.js";
import { ls } from "../../../../strings.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export const ProtectedBy = () => (
  <div className="flex flex-row gap-1 items-center h-[14px] text-fg-disabled">
    <span className="text-[11px]">{ls.protectedBy.title}</span>
    <AlchemyLogo />
  </div>
);
