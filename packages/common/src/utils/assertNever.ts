export const assertNever = (_x: never, msg: string): never => {
  throw new Error(msg);
};
