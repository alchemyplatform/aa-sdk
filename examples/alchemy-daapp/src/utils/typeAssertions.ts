export function assertNever(x: never): never {
  throw new Error(`${x} was not never`);
}
