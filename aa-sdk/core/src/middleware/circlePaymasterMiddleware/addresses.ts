import { type Address, type Chain } from 'viem';
import { arbitrum, arbitrumSepolia, base, baseSepolia } from 'viem/chains';

export const circlePaymasterAddresses: Record<Chain['id'], Address> = {
  [arbitrum.id]: '0x6C973eBe80dCD8660841D4356bf15c32460271C9',
  [arbitrumSepolia.id]: '0x31BE08D380A21fc740883c0BC434FcFc88740b58',
  [base.id]: '0x6C973eBe80dCD8660841D4356bf15c32460271C9',
  [baseSepolia.id]: '0x31BE08D380A21fc740883c0BC434FcFc88740b58'
};

export const usdcAddresses: Record<Chain['id'], Address> = {
  [arbitrum.id]: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  [arbitrumSepolia.id]: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d',
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  [baseSepolia.id]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
};
