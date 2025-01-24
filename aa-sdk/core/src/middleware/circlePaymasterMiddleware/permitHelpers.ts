import {
  maxUint256,
  erc20Abi,
  type Address,
  type Chain,
  type GetContractReturnType,
  type TypedDataDefinition
} from 'viem';
import { type MiddlewareClient } from '../actions.js';

export const eip2612Abi = [
  ...erc20Abi,
  {
    inputs: [
      {
        internalType: 'address',
        name: 'owner',
        type: 'address'
      }
    ],
    stateMutability: 'view',
    type: 'function',
    name: 'nonces',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ]
  },
  {
    inputs: [],
    name: 'version',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

type Eip2612PermitParams = {
  token: GetContractReturnType<typeof eip2612Abi, MiddlewareClient, Address>;
  chain: Chain;
  ownerAddress: Address;
  spenderAddress: Address;
  value: bigint;
};

// Adapted from https://github.com/vacekj/wagmi-permit/blob/main/src/permit.ts
export async function eip2612Permit({
  token,
  chain,
  ownerAddress,
  spenderAddress,
  value
}: Eip2612PermitParams): Promise<TypedDataDefinition> {
  return {
    types: {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' }
      ]
    },
    primaryType: 'Permit',
    domain: {
      name: (await token.read.name()) as string,
      version: (await token.read.version()) as string,
      chainId: chain.id,
      verifyingContract: token.address
    },
    message: {
      owner: ownerAddress,
      spender: spenderAddress,
      value,
      nonce: await token.read.nonces([ownerAddress]),
      // The paymaster cannot access block.timestamp due to 4337 opcode
      // restrictions, so the deadline must be MAX_UINT256.
      deadline: maxUint256
    }
  };
}
