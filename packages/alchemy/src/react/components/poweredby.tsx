import { AlchemyLogo } from "../icons/alchemy.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export const PoweredBy = () => (
  <div className="flex flex-row gap-1 items-center">
    <span className="text-fg-disabled text-xs">powered by</span>
    <AlchemyLogo className="fill-fg-disabled" />
  </div>
);
