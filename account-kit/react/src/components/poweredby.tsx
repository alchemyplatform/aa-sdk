import { AlchemyLogo } from "../icons/alchemy.js";
import { ls } from "../strings.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export const PoweredBy = () => (
  <div className="flex flex-row gap-1 items-center h-8 text-fg-disabled">
    <span className="text-xs">{ls.poweredBy.title}</span>
    <AlchemyLogo />
  </div>
);
