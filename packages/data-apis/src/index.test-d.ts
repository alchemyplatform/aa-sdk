import { expectTypeOf, test } from "vitest";
import { createClient, http, type Chain, type Client } from "viem";
import { mainnet } from "viem/chains";
import { alchemyTransport, type AlchemyTransport } from "@alchemy/common";
import {
  createDataClient,
  dataActions,
  getNftsForOwner,
  type AlchemyDataClient,
  type DataActions,
  type GetAssetTransfersResult,
  type GetNftsForOwnerParams,
  type GetNftsForOwnerResult,
  type GetTokensByAddressResult,
} from "./index.js";

declare const dataClient: AlchemyDataClient;
declare const baseClient: Client<AlchemyTransport, Chain | undefined>;

test("createDataClient returns a viem client extended with DataActions", () => {
  expectTypeOf(
    createDataClient({ apiKey: "key", network: "eth-mainnet" }),
  ).toEqualTypeOf<AlchemyDataClient>();
  expectTypeOf(dataClient).toMatchTypeOf<DataActions>();
});

test("decorator path matches the convenience client surface", () => {
  const extended = createClient({
    chain: mainnet,
    transport: alchemyTransport({ apiKey: "key" }),
  }).extend(dataActions);
  expectTypeOf(extended.nft.getNftsForOwner).toEqualTypeOf<
    AlchemyDataClient["nft"]["getNftsForOwner"]
  >();
});

test("dataActions requires an Alchemy transport client", () => {
  const plainHttp = createClient({ chain: mainnet, transport: http() });
  // @ts-expect-error plain http transport is not an AlchemyTransport
  dataActions(plainHttp);
  dataActions(baseClient);
});

test("results carry spec-accurate shapes", () => {
  expectTypeOf<GetTokensByAddressResult["data"]>().toMatchTypeOf<{
    tokens?: unknown[];
    pageKey?: string;
  }>();
  // the transfers notFound string branch is collapsed away
  expectTypeOf<GetAssetTransfersResult>().not.toMatchTypeOf<string>();
});

test("network-scoped params accept all three network formats", () => {
  expectTypeOf<GetNftsForOwnerParams["network"]>().toMatchTypeOf<
    Chain | string | undefined
  >();
  // bracketed wire keys are exposed unbracketed
  expectTypeOf<GetNftsForOwnerParams>().toMatchTypeOf<{
    owner: string;
    contractAddresses?: string[];
    excludeFilters?: ("SPAM" | "AIRDROPS")[];
  }>();
});

test("standalone actions return the same results as the decorator", () => {
  expectTypeOf(getNftsForOwner).returns.toEqualTypeOf<
    Promise<GetNftsForOwnerResult>
  >();
});

test("paginated companions yield pages", () => {
  expectTypeOf(dataClient.nft.getNftsForOwnerPages).returns.toEqualTypeOf<
    AsyncGenerator<GetNftsForOwnerResult, void, undefined>
  >();
});
