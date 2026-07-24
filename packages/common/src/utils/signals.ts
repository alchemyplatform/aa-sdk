/**
 * Combines multiple abort signals into one that aborts when any input aborts.
 * Uses AbortSignal.any where available, with an addEventListener fallback.
 *
 * @param {...(AbortSignal | undefined)} signals Signals to combine (undefined entries are skipped)
 * @returns {AbortSignal | undefined} The combined signal, or undefined if none were provided
 */
export function composeSignals(
  ...signals: Array<AbortSignal | undefined>
): AbortSignal | undefined {
  const present = signals.filter((s): s is AbortSignal => s != null);
  if (present.length === 0) return undefined;
  if (present.length === 1) return present[0];
  if (typeof AbortSignal.any === "function") {
    return AbortSignal.any(present);
  }
  const controller = new AbortController();
  for (const signal of present) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }
    signal.addEventListener("abort", () => controller.abort(signal.reason), {
      once: true,
      signal: controller.signal,
    });
  }
  return controller.signal;
}

/**
 * Waits for a duration, rejecting immediately with the signal's reason if the
 * signal aborts first.
 *
 * @param {number} ms Milliseconds to wait
 * @param {AbortSignal} [signal] Optional abort signal
 * @returns {Promise<void>} Resolves after the delay
 */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
