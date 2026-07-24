import { expectTypeOf, test } from "vitest";
import {
  AlchemyApiError,
  AlchemyError,
  createDataClient,
  getNftsForOwner,
  type AlchemyApiErrorDetails,
  type AlchemyDataClient,
  type DataActions,
  type GetAssetTransfersResult,
  type GetNftsForOwnerParams,
  type GetNftsForOwnerResult,
  type GetTokensByAddressResult,
} from "./index.js";

declare const dataClient: AlchemyDataClient;

test("createDataClient returns a plain container with the namespaced actions", () => {
  expectTypeOf(
    createDataClient({ apiKey: "key", network: "eth-mainnet" }),
  ).toEqualTypeOf<AlchemyDataClient>();
  expectTypeOf(dataClient).toMatchTypeOf<DataActions>();
  // the container is plain config + network — no chain-library client shape
  expectTypeOf(dataClient.config).toMatchTypeOf<{
    apiKey?: string;
    jwt?: string;
    url?: string;
  }>();
});

test("normalized API errors are exported from the data package", () => {
  expectTypeOf(
    new AlchemyApiError("request failed"),
  ).toMatchTypeOf<AlchemyError>();
  expectTypeOf<AlchemyApiErrorDetails>().toMatchTypeOf<{
    status?: number;
    code?: string | number;
    requestId?: string;
    retryAfter?: number;
  }>();
});

test("network is optional at construction and string-only", () => {
  expectTypeOf(
    createDataClient({ apiKey: "key" }),
  ).toEqualTypeOf<AlchemyDataClient>();
  // @ts-expect-error viem Chain objects are not accepted by the core
  createDataClient({ apiKey: "key", network: { id: 1 } });
});

test("network-scoped params accept slug and CAIP-2 strings only", () => {
  expectTypeOf<GetNftsForOwnerParams["network"]>().toMatchTypeOf<
    string | undefined
  >();
  // bracketed wire keys are exposed unbracketed
  expectTypeOf<GetNftsForOwnerParams>().toMatchTypeOf<{
    owner: string;
    contractAddresses?: string[];
    excludeFilters?: ("SPAM" | "AIRDROPS")[];
  }>();
});

test("results carry spec-accurate shapes", () => {
  expectTypeOf<GetTokensByAddressResult["data"]>().toMatchTypeOf<{
    tokens?: unknown[];
    pageKey?: string;
  }>();
  // the transfers notFound string branch is collapsed away
  expectTypeOf<GetAssetTransfersResult>().not.toMatchTypeOf<string>();
});

test("standalone actions return the same results as the client methods", () => {
  expectTypeOf(getNftsForOwner).returns.toEqualTypeOf<
    Promise<GetNftsForOwnerResult>
  >();
});

test("paginated companions yield pages", () => {
  expectTypeOf(dataClient.nft.getNftsForOwnerPages).returns.toEqualTypeOf<
    AsyncGenerator<GetNftsForOwnerResult, void, undefined>
  >();
});
