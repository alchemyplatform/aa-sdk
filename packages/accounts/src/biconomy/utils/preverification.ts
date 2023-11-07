import { type NotPromise, packUserOp } from "@biconomy/common"; // '@account-abstraction/utils'
import { arrayify, hexlify } from "ethers/lib/utils";
import { BigNumber } from "ethers";
import type { UserOperation } from "./types.js";
export interface GasOverheads {
  /**
   * fixed overhead for entire handleOp bundle.
   */
  fixed: number;

  /**
   * per userOp overhead, added on top of the above fixed per-bundle.
   */
  perUserOp: number;

  /**
   * overhead for userOp word (32 bytes) block
   */
  perUserOpWord: number;

  // perCallDataWord: number

  /**
   * zero byte cost, for calldata gas cost calculations
   */
  zeroByte: number;

  /**
   * non-zero byte cost, for calldata gas cost calculations
   */
  nonZeroByte: number;

  /**
   * expected bundle size, to split per-bundle overhead between all ops.
   */
  bundleSize: number;

  /**
   * expected length of the userOp signature.
   */
  sigSize: number;
}

export interface VerificationGasLimits {
  /**
   * per userOp gasLimit for validateUserOp()
   * called from entrypoint to the account
   * should consider max execution
   */
  validateUserOpGas: number;

  /**
   * per userOp gasLimit for validatePaymasterUserOp()
   * called from entrypoint to the paymaster
   * should consider max execution
   */
  validatePaymasterUserOpGas: number;

  /**
   * per userOp gasLimit for postOp()
   * called from entrypoint to the paymaster
   * should consider max execution for paymaster/s this account may use
   */
  postOpGas: number;
}

export const DefaultGasOverheads: GasOverheads = {
  fixed: 21000,
  perUserOp: 18300,
  perUserOpWord: 4,
  zeroByte: 4,
  nonZeroByte: 16,
  bundleSize: 1,
  sigSize: 65,
};

export const DefaultGasLimits: VerificationGasLimits = {
  validateUserOpGas: 100000,
  validatePaymasterUserOpGas: 100000,
  postOpGas: 10877,
};

/**
 * calculate the preVerificationGas of the given UserOperation
 * preVerificationGas (by definition) is the cost overhead that can't be calculated on-chain.
 * it is based on parameters that are defined by the Ethereum protocol for external transactions.
 * @param userOp filled userOp to calculate. The only possible missing fields can be the signature and preVerificationGas itself
 * @param overheads gas overheads to use, to override the default values
 */
export function calcPreVerificationGas(
  userOp: Partial<NotPromise<UserOperation>>,
  overheads?: Partial<GasOverheads>
): BigNumber {
  const ov = { ...DefaultGasOverheads, ...(overheads ?? {}) };
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  const p: NotPromise<UserOperation> = {
    // dummy values, in case the UserOp is incomplete.
    paymasterAndData: "0x",
    preVerificationGas: BigNumber.from(21000), // dummy value, just for calldata cost
    signature: hexlify(Buffer.alloc(ov.sigSize, 1)), // dummy signature
    ...userOp,
  } as any;

  const packed = arrayify(packUserOp(p, false));
  const lengthInWord = (packed.length + 31) / 32;
  /**
   * general explanation
   * 21000 base gas
   * ~ 18300 gas per userOp : corresponds to _validateAccountAndPaymasterValidationData() method,
   * Some lines in _handlePostOp() after actualGasCost calculation and compensate() method called in handleOps() method
   * plus any gas overhead that can't be tracked on-chain
   * (if bundler needs to charge the premium one way is to increase this value for ops to sign)
   */
  const callDataCost = packed
    .map((x) => (x === 0 ? ov.zeroByte : ov.nonZeroByte))
    .reduce((sum, x) => sum + x);
  const ret = Math.round(
    callDataCost +
      ov.fixed / ov.bundleSize +
      ov.perUserOp +
      ov.perUserOpWord * lengthInWord
  );
  if (ret) {
    return BigNumber.from(ret);
  } else {
    throw new Error("can't calculate preVerificationGas");
  }
}
