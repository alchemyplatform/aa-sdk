import { useUiConfig, type UiConfigStore } from "../useUiConfig.js";

export function useAuthConfig<
  T extends unknown | undefined = NonNullable<UiConfigStore["auth"]>,
>(selector?: (state: NonNullable<UiConfigStore["auth"]>) => T): T;

export function useAuthConfig(
  selector?: (
    state: NonNullable<UiConfigStore["auth"]>,
  ) => NonNullable<UiConfigStore["auth"]> | undefined,
): NonNullable<UiConfigStore["auth"]> | undefined {
  const state = useUiConfig((state) => {
    if (!state.auth) {
      throw new Error("Auth config expected to be present in UiConfigStore");
    }
    return selector ? selector(state.auth) : state.auth;
  });

  return state;
}
