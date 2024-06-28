import { useAlchemyAccountContext } from "../context.js";
import { MissingUiConfigComponentError } from "../errors.js";

export const useUiConfig = () => {
  const { ui } = useAlchemyAccountContext();
  if (ui == null) {
    throw new MissingUiConfigComponentError("useUiConfig");
  }

  return {
    ...ui.config,
  };
};
