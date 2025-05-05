import type { MfaFactor } from "../client/types.js";

export function parseMfaError(error: unknown): MfaFactor[] | null {
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message);
      if (parsed?.data?.multiFactors) {
        return parsed.data.multiFactors;
      }
    } catch {
      // ignore JSON parse failures
    }
  }
  return null;
}
