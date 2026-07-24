import { alchemyTransport, type AlchemyTransport } from "@alchemy/common";
import { createClient, http, type Chain, type Client } from "viem";
import { mainnet } from "viem/chains";
import { expectTypeOf, test } from "vitest";
import type { DataActions } from "../decorator.js";
import { dataActions } from "./dataActions.js";

declare const baseClient: Client<AlchemyTransport, Chain | undefined>;

test("the parked adapter extends viem clients with the core action surface", () => {
  const extended = createClient({
    chain: mainnet,
    transport: alchemyTransport({ apiKey: "key" }),
  }).extend(dataActions);
  expectTypeOf(extended.nft.getNftsForOwner).toEqualTypeOf<
    DataActions["nft"]["getNftsForOwner"]
  >();
  expectTypeOf(dataActions(baseClient)).toEqualTypeOf<DataActions>();
});

test("the adapter requires an Alchemy transport", () => {
  const plainHttp = createClient({ chain: mainnet, transport: http() });
  // @ts-expect-error plain http transport is not an AlchemyTransport
  dataActions(plainHttp);
});
