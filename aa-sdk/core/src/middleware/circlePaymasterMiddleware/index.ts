import {
  encodePacked,
  maxUint256,
  parseErc6492Signature,
  numberToHex
} from 'viem';
import type { ClientMiddlewareConfig } from '../../client/types';
import { ChainNotFoundError } from '../../errors/client.js';
import type { ClientMiddlewareFn } from '../types.ts';
import { eip2612Permit } from './permitHelpers.js';
import { getContracts } from './contractHelpers.js';

export type CirclePaymasterMiddlewareParams = {
  allowancePerUserOp?: bigint;
};

export function circlePaymasterMiddleware(
  params?: CirclePaymasterMiddlewareParams
): Pick<ClientMiddlewareConfig, 'dummyPaymasterAndData' | 'paymasterAndData'> {
  const permitAmount = params?.allowancePerUserOp ?? maxUint256;

  const paymasterAndData: ClientMiddlewareFn = async (
    uo,
    { client, account }
  ) => {
    if (!client.chain) throw new ChainNotFoundError();

    const entrypoint = account.getEntryPoint();

    if (entrypoint.version === '0.6.0') {
      throw new Error('Circle Paymaster does not support EntryPoint v0.6');
    }

    const { usdcContract, paymasterContract } = getContracts(client);

    const permitData = await eip2612Permit({
      token: usdcContract,
      chain: client.chain,
      ownerAddress: account.address,
      spenderAddress: paymasterContract.address,
      value: permitAmount
    });

    const wrappedPermitSignature = await account.signTypedData(permitData);
    const { signature: permitSignature } = parseErc6492Signature(
      wrappedPermitSignature
    );

    const paymasterData = encodePacked(
      ['uint8', 'address', 'uint256', 'bytes'],
      [0, usdcContract.address, permitAmount, permitSignature]
    );

    const paymasterPostOpGasLimit = numberToHex(
      await paymasterContract.read.additionalGasCharge()
    );

    return {
      ...uo,
      paymaster: paymasterContract.address,
      paymasterData,
      paymasterPostOpGasLimit
    };
  };

  return {
    paymasterAndData,
    dummyPaymasterAndData: paymasterAndData
  };
}
