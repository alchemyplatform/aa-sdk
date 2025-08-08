import { bigIntMultiply } from "./utils";

describe("bigIntMultiply", () => {
  describe("integer multipliers", () => {
    it("should multiply with positive integer", () => {
      expect(bigIntMultiply(100n, 5)).toBe(500n);
      expect(bigIntMultiply(100, 5)).toBe(500n);
      expect(bigIntMultiply(0n, 5)).toBe(0n);
    });

    it("should multiply with negative integer", () => {
      expect(bigIntMultiply(100n, -5)).toBe(-500n);
      expect(bigIntMultiply(-100n, 5)).toBe(-500n);
      expect(bigIntMultiply(-100n, -5)).toBe(500n);
    });

    it("should handle zero multiplier", () => {
      expect(bigIntMultiply(100n, 0)).toBe(0n);
      expect(bigIntMultiply(-100n, 0)).toBe(0n);
    });
  });

  describe("decimal multipliers with CEIL mode (default)", () => {
    it("should handle basic decimal multiplication", () => {
      expect(bigIntMultiply(100n, 1.5)).toBe(150n);
      expect(bigIntMultiply(100n, 2.25)).toBe(225n);
      expect(bigIntMultiply(1000n, 0.1)).toBe(100n);
    });

    it("should apply CEIL rounding (always round up when there are remainders)", () => {
      // CEIL: (product + scale - 1) / scale
      expect(bigIntMultiply(100n, 1.234)).toBe(124n); // 12340/100 = 123.4, ceil = 124
      expect(bigIntMultiply(100n, 1.001)).toBe(101n); // 10010/100 = 100.1, ceil = 101
      expect(bigIntMultiply(1000n, 0.0001)).toBe(1n); // 100/1000 = 0.1, ceil = 1
    });

    it("should handle exact values with CEIL", () => {
      expect(bigIntMultiply(100n, 1.0)).toBe(100n);
      expect(bigIntMultiply(100n, 2.0)).toBe(200n);
      expect(bigIntMultiply(100n, 1.5)).toBe(150n); // exact, no remainder
    });
  });

  describe("ROUND rounding mode", () => {
    it("should round to nearest integer", () => {
      // ROUND: (product + scale/2) / scale
      expect(bigIntMultiply(100n, 1.234, "ROUND")).toBe(123n); // 123.4 rounds to 123
      expect(bigIntMultiply(100n, 1.235, "ROUND")).toBe(124n); // 123.5 rounds to 124
      expect(bigIntMultiply(100n, 1.236, "ROUND")).toBe(124n); // 123.6 rounds to 124
    });

    it("should handle edge cases for rounding", () => {
      expect(bigIntMultiply(100n, 1.5, "ROUND")).toBe(150n);
      expect(bigIntMultiply(100n, 2.5, "ROUND")).toBe(250n);
      expect(bigIntMultiply(1000n, 0.0005, "ROUND")).toBe(1n); // 0.5 rounds up
      expect(bigIntMultiply(1000n, 0.0004, "ROUND")).toBe(0n); // 0.4 rounds down
    });
  });

  describe("FLOOR rounding mode", () => {
    it("should always round down", () => {
      // FLOOR: product / scale (integer division)
      expect(bigIntMultiply(100n, 1.9, "FLOOR")).toBe(190n);
      expect(bigIntMultiply(100n, 1.1, "FLOOR")).toBe(110n);
      expect(bigIntMultiply(100n, 1.999, "FLOOR")).toBe(199n);
      expect(bigIntMultiply(100n, 1.001, "FLOOR")).toBe(100n); // floors to 100
    });

    it("should handle negative numbers correctly", () => {
      expect(bigIntMultiply(-100n, 1.9, "FLOOR")).toBe(-190n);
      expect(bigIntMultiply(100n, -1.9, "FLOOR")).toBe(-190n);
    });
  });

  describe("precision limits", () => {
    it("should accept up to 4 decimal places", () => {
      expect(bigIntMultiply(10000n, 1.2345)).toBe(12345n); // CEIL mode, exact value
      expect(bigIntMultiply(1000n, 0.1234, "FLOOR")).toBe(123n);
    });

    it("should throw error for more than 4 decimal places", () => {
      expect(() => bigIntMultiply(100n, 1.23456)).toThrow(
        "bigIntMultiply max precision is 4 decimal places."
      );

      expect(() => bigIntMultiply(100n, 0.123456)).toThrow(
        "bigIntMultiply max precision is 4 decimal places."
      );
    });
  });

  describe("edge cases", () => {
    it("should handle very large BigInt values", () => {
      const largeBigInt = BigInt("123456789012345678901234567890");
      expect(bigIntMultiply(largeBigInt, 2)).toBe(
        BigInt("246913578024691357802469135780")
      );
      expect(bigIntMultiply(largeBigInt, 1.5)).toBe(
        BigInt("185185183518518518351851851835")
      );
    });

    it("should handle negative multipliers", () => {
      expect(bigIntMultiply(100n, -1.5)).toBe(-150n);
      expect(bigIntMultiply(-100n, 1.5)).toBe(-150n);
      expect(bigIntMultiply(-100n, -1.5)).toBe(150n);

      // Test rounding with negatives
      expect(bigIntMultiply(100n, -1.234, "FLOOR")).toBe(-124n); // -123.4 floors to -124
      expect(bigIntMultiply(100n, -1.234, "CEIL")).toBe(-123n); // -123.4 ceils to -123
    });

    it("should handle fractional results that become zero or one", () => {
      expect(bigIntMultiply(1n, 0.4, "FLOOR")).toBe(0n); // floors to 0
      expect(bigIntMultiply(1n, 0.6, "FLOOR")).toBe(0n); // floors to 0
      expect(bigIntMultiply(1n, 0.4, "CEIL")).toBe(1n); // ceils to 1
      expect(bigIntMultiply(1n, 0.6, "CEIL")).toBe(1n); // ceils to 1
      expect(bigIntMultiply(1n, 0.4, "ROUND")).toBe(0n); // rounds to 0
      expect(bigIntMultiply(1n, 0.6, "ROUND")).toBe(1n); // rounds to 1
    });
  });

  describe("comparison of rounding modes", () => {
    const testCases = [
      { base: 100n, multiplier: 1.234, round: 123n, floor: 123n, ceil: 124n },
      { base: 100n, multiplier: 1.567, round: 157n, floor: 156n, ceil: 157n },
      { base: 100n, multiplier: 1.5, round: 150n, floor: 150n, ceil: 150n },
      { base: 1000n, multiplier: 0.1234, round: 123n, floor: 123n, ceil: 124n },
      { base: 1000n, multiplier: 0.0001, round: 0n, floor: 0n, ceil: 1n },
    ];

    testCases.forEach(({ base, multiplier, round, floor, ceil }) => {
      it(`should handle ${base} * ${multiplier} correctly across rounding modes`, () => {
        expect(bigIntMultiply(base, multiplier, "ROUND")).toBe(round);
        expect(bigIntMultiply(base, multiplier, "FLOOR")).toBe(floor);
        expect(bigIntMultiply(base, multiplier, "CEIL")).toBe(ceil);
      });
    });
  });

  describe("floating point precision issues", () => {
    it("should avoid precision issues with decimal multiplication", () => {
      // These test cases would fail with naive floating point arithmetic
      expect(bigIntMultiply(100000n, 0.0003)).toBe(30n);
      expect(bigIntMultiply(333333n, 0.0003, "FLOOR")).toBe(99n);
      expect(bigIntMultiply(333333n, 0.0003, "CEIL")).toBe(100n);

      // Test the classic floating point precision issues
      expect(bigIntMultiply(10000n, 0.0001)).toBe(1n);
    });
  });
});
