import { maxUint32 } from "viem";
import { randomInt } from "crypto";

export function genEntityId(): number {
  const min: number = 1;
  const max: number = Number(maxUint32);

  return randomInt(min, max + 1);
}
