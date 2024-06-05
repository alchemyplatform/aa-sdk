import { AlchemyLogo } from "../icons/alchemy.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export const PoweredBy = () => (
  <div className="flex flex-row gap-1 items-center h-8 text-fg-disabled">
    <span className="text-xs">powered by</span>
    <AlchemyLogo />
  </div>
);
