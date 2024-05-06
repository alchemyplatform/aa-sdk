import { AlchemyLogo } from "../icons/alchemy.js";

// eslint-disable-next-line jsdoc/require-jsdoc
export const PoweredBy = () => (
  <div className="flex flex-row gap-1">
    <span className="text-fg-disabled">powered by</span>
    <AlchemyLogo className="fill-fg-disabled" />
  </div>
);
