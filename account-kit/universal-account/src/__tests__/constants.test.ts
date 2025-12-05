import { describe, it, expect } from "vitest";
import { CHAIN_ID, TOKEN_TYPE, NATIVE_TOKEN_ADDRESS } from "../constants.js";

describe("constants", () => {
  describe("CHAIN_ID", () => {
    it("exports all EVM chain IDs with correct values", () => {
      expect(CHAIN_ID.ETHEREUM).toBe(1);
      expect(CHAIN_ID.BNB_CHAIN).toBe(56);
      expect(CHAIN_ID.AVALANCHE).toBe(43114);
      expect(CHAIN_ID.POLYGON).toBe(137);

      expect(CHAIN_ID.BASE).toBe(8453);
      expect(CHAIN_ID.ARBITRUM).toBe(42161);
      expect(CHAIN_ID.OPTIMISM).toBe(10);
      expect(CHAIN_ID.LINEA).toBe(59144);

      expect(CHAIN_ID.MANTLE).toBe(5000);
      expect(CHAIN_ID.MONAD).toBe(143);
      expect(CHAIN_ID.PLASMA).toBe(9745);
      expect(CHAIN_ID.X_LAYER).toBe(196);
      expect(CHAIN_ID.HYPER_EVM).toBe(999);
      expect(CHAIN_ID.BERACHAIN).toBe(80094);
      expect(CHAIN_ID.SONIC).toBe(146);
      expect(CHAIN_ID.MERLIN).toBe(4200);
    });

    it("exports correct non-EVM chain IDs", () => {
      expect(CHAIN_ID.SOLANA).toBe(101);
    });

    it("exports exactly 17 chain IDs", () => {
      // This ensures we don't accidentally add/remove chains without updating tests
      expect(Object.keys(CHAIN_ID)).toHaveLength(17);
    });
  });

  describe("TOKEN_TYPE", () => {
    it("exports correct token types", () => {
      expect(TOKEN_TYPE.ETH).toBe("ETH");
      expect(TOKEN_TYPE.USDC).toBe("USDC");
      expect(TOKEN_TYPE.USDT).toBe("USDT");
      expect(TOKEN_TYPE.SOL).toBe("SOL");
      expect(TOKEN_TYPE.BTC).toBe("BTC");
      expect(TOKEN_TYPE.BNB).toBe("BNB");
      expect(TOKEN_TYPE.MNT).toBe("MNT");
    });
  });

  describe("NATIVE_TOKEN_ADDRESS", () => {
    it("is the zero address", () => {
      expect(NATIVE_TOKEN_ADDRESS).toBe(
        "0x0000000000000000000000000000000000000000",
      );
    });

    it("has correct length for an Ethereum address", () => {
      expect(NATIVE_TOKEN_ADDRESS).toHaveLength(42);
      expect(NATIVE_TOKEN_ADDRESS.startsWith("0x")).toBe(true);
    });
  });
});
