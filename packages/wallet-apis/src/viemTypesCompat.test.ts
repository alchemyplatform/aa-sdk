import { describe, it, expectTypeOf } from "vitest";
import type { Account, Chain } from "viem";
import type {
  SendCallsParameters,
  SendCallsReturnType,
  SignMessageParameters,
  SignMessageReturnType,
  SignTypedDataParameters,
  SignTypedDataReturnType,
  GetCapabilitiesParameters,
  GetCapabilitiesReturnType,
} from "viem/actions";
import type { SendCallsParams, SendCallsResult } from "./actions/sendCalls.js";
import type {
  SignMessageParams,
  SignMessageResult,
} from "./actions/signMessage.js";
import type {
  SignTypedDataParams,
  SignTypedDataResult,
} from "./actions/signTypedData.js";
import type {
  GetCapabilitiesParams,
  GetCapabilitiesResult,
} from "./actions/getCapabilities.js";

/**
 * Type compatibility tests for viem action interfaces.
 *
 * These tests verify that our action param/result types satisfy
 * viem's action interfaces so that callers using viem's types
 * (e.g. via `getAction`) get correct behavior.
 */
describe("viem action type compatibility", () => {
  describe("sendCalls", () => {
    it("return type satisfies viem's SendCallsReturnType", () => {
      expectTypeOf<SendCallsResult>().toExtend<SendCallsReturnType>();
    });

    it("params accept viem-style input", () => {
      // SendCallsParameters is heavily generic; instantiate with concrete type args,
      // then check the fields that we are able to satisfy.
      type Concrete = SendCallsParameters<
        Chain,
        Account,
        Chain | undefined,
        readonly [{ to: `0x${string}`; data?: `0x${string}`; value?: bigint }]
      >;
      expectTypeOf<Concrete["account"]>().toExtend<
        SendCallsParams["account"]
      >();
      expectTypeOf<Concrete["calls"][number]>().toExtend<
        SendCallsParams["calls"][number]
      >();
      // viem's Capabilities is `{ [key: string]: any } & { paymasterService?: ... }`.
      // Our capabilities has a more specific shape; verify it satisfies Record<string, unknown>.
      expectTypeOf<NonNullable<SendCallsParams["capabilities"]>>().toExtend<
        Record<string, unknown>
      >();
      // viem uses `chain?: Chain`; ours matches.
      expectTypeOf<Concrete["chain"]>().toExtend<SendCallsParams["chain"]>();
    });
  });

  describe("signMessage", () => {
    it("return type satisfies viem's SignMessageReturnType", () => {
      expectTypeOf<SignMessageResult>().toExtend<SignMessageReturnType>();
    });

    it("params accept viem-style input", () => {
      expectTypeOf<SignMessageParameters>().toExtend<SignMessageParams>();
    });
  });

  describe("signTypedData", () => {
    it("return type satisfies viem's SignTypedDataReturnType", () => {
      expectTypeOf<SignTypedDataResult>().toExtend<SignTypedDataReturnType>();
    });

    it("params accept viem-style input", () => {
      expectTypeOf<SignTypedDataParameters>().toExtend<SignTypedDataParams>();
    });
  });

  describe("getCapabilities", () => {
    it("return type accepts viem's per-chain capabilities", () => {
      expectTypeOf<
        GetCapabilitiesReturnType<number>
      >().toExtend<GetCapabilitiesResult>();
    });

    it("params accept viem-style input", () => {
      expectTypeOf<GetCapabilitiesParameters>().toExtend<GetCapabilitiesParams>();
    });
  });
});
