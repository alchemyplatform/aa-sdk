import { getContract } from 'viem';
import { type MiddlewareClient } from '../actions.js';
import { ChainNotFoundError } from '../../errors/client.js';
import { circlePaymasterAddresses, usdcAddresses } from './addresses.js';
import { eip2612Abi } from './permitHelpers.js';

export const paymasterAbi = [
  {
    inputs: [],
    stateMutability: 'view',
    type: 'function',
    name: 'additionalGasCharge',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ]
  }
] as const;

export const getContracts = (client: MiddlewareClient) => {
  if (!client.chain) throw new ChainNotFoundError();

  const usdcContract = getContract({
    client,
    address: usdcAddresses[client.chain.id],
    abi: eip2612Abi
  });

  const paymasterContract = getContract({
    client,
    address: circlePaymasterAddresses[client.chain.id],
    abi: paymasterAbi
  });

  return { usdcContract, paymasterContract };
};
