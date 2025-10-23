import { useUiConfig, type UiConfigStore } from "./useUiConfig.js";

// TODO: give this a selector param to prevent unnecessary re-renders
export function useAuthConfig(): NonNullable<UiConfigStore["auth"]> {
  const { auth } = useUiConfig();
  if (!auth) {
    throw new Error("Auth config should be present in UiConfig");
  }
  return auth;
}
