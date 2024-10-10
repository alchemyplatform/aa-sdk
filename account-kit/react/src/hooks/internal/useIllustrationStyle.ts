import { useUiConfig } from "../useUiConfig.js";

export function useIllustrationStyle() {
  return useUiConfig(({ illustrationStyle }) => ({
    illustrationStyle: illustrationStyle ?? "outline",
  }));
}
