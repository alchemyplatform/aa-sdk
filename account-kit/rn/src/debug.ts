// import type { Mutate } from "zustand";

import type { StoreState } from "@account-kit/core";
import {
  StoreApi,
  StoreMutatorIdentifier,
  StoreMutators,
} from "zustand/vanilla";

export type Mutate<S, Ms> = number extends Ms["length" & keyof Ms]
  ? S
  : Ms extends []
  ? S
  : Ms extends [[infer Mi, infer Ma], ...infer Mrs]
  ? Mutate<StoreMutators<S, Ma>[Mi & StoreMutatorIdentifier], Mrs>
  : never;

type Middleware = [
  ["zustand/subscribeWithSelector", never],
  ["zustand/persist", StoreState]
];

type TestType = Mutate<StoreApi<StoreState>, Middleware>;

// 🔍 Force TypeScript to display inferred type
