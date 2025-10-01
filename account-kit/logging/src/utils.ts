// just in case we're in a setting that doesn't have these types defined
declare const __DEV__: boolean | undefined;
declare const window: Window | undefined;

export function isClientDevMode() {
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    return true;
  }

  if (
    typeof process !== "undefined" &&
    process.env.NODE_ENV === "development"
  ) {
    return true;
  }

  if (
    typeof window !== "undefined" &&
    window.location?.hostname?.includes("localhost")
  ) {
    return true;
  }

  return false;
}
