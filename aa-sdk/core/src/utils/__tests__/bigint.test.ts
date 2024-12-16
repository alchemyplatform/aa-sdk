import { RoundingMode, bigIntMultiply } from "../bigint.js";

describe("BigInt utility", () => {
  describe("multiplication operations", () => {
    it("should multiply a big int correctly with an int", async () => {
      expect(bigIntMultiply(10n, 2, RoundingMode.ROUND_UP)).toEqual(20n);
    });

    it("should multiply a big int correctly with a float", async () => {
      expect(bigIntMultiply(10n, 0.5, RoundingMode.ROUND_UP)).toEqual(5n);
    });

    it("should fail to multiply a big int and a float with too much precision", async () => {
      expect(() =>
        bigIntMultiply(10n, 0.53958491842948789, RoundingMode.ROUND_UP)
      ).toThrowError(
        "bigIntMultiply requires a multiplier validated number as the second argument"
      );
    });

    it("should multiply a big int correctly when rouding up", async () => {
      expect(bigIntMultiply(10n, 0.53, RoundingMode.ROUND_UP)).toEqual(6n);
    });

    it("should multiply a big int correctly when rouding down", async () => {
      expect(bigIntMultiply(10n, 0.53, RoundingMode.ROUND_DOWN)).toEqual(5n);
    });

    it("should multiply correctly with default settings", () => {
      expect(bigIntMultiply(100n, 1.15)).toEqual(115n);
    });
  });
});
