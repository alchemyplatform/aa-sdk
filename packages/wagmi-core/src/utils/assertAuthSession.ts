import type { AuthSession } from "@alchemy/auth";

export function assertAuthSession(
  authSession: AuthSession | null,
  action: string,
): asserts authSession is AuthSession {
  if (!authSession) {
    throw new Error(
      `Auth session is required for action '${action}'. Please authenticate first.`,
    );
  }
}
