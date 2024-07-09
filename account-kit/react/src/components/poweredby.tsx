import { AlchemyLogo } from "../icons/alchemy.js";
import { ls } from "../strings.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export const PoweredBy = () => (
  <div className="flex flex-row gap-1 items-center h-5 text-fg-disabled">
    <AlchemyLogo />
    <span className="text-xs">{ls.poweredBy.title}</span>
  </div>
);
