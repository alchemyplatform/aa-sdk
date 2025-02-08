import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const exhaustiveGuard = (_value: never, message: string): never => {
  throw new Error(message);
};
