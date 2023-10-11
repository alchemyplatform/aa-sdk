export function getRpcUrl() {
  // This should run in the browser only. Without this check, the build fails.
  if (typeof window === "undefined") {
    return "";
  }

  return `/api/rpc`;
}
