import { maxUint32 } from "viem";

export function genEntityId(): number {
  const min: number = 1;
  const max: number = Number(maxUint32);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}
