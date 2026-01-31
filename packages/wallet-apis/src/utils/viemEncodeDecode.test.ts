import type {
  PreparedCall_Authorization,
  PreparedCall_Permit,
  PreparedCall_UserOpV060,
  PreparedCall_UserOpV070,
} from "@alchemy/wallet-api-types";
import { viemEncodePreparedCall } from "./viemEncode.js";
import { viemDecodePreparedCall } from "./viemDecode.js";

describe("transforms", () => {
  it("transforms a prepared call UO v060 into a viem-compatible call", () => {
    const transformed = viemEncodePreparedCall(preparedCallV060);
    expect(transformed).toMatchInlineSnapshot(`
      {
        "chainId": 1,
        "data": {
          "callData": "0xb61d27f60000000000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
          "callGasLimit": 21000n,
          "initCode": "0x",
          "maxFeePerGas": 1500000000n,
          "maxPriorityFeePerGas": 1500000000n,
          "nonce": 0n,
          "preVerificationGas": 47464n,
          "sender": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          "verificationGasLimit": 100000n,
        },
        "feePayment": {
          "maxAmount": 0n,
          "sponsored": true,
          "tokenAddress": "0x0000000000000000000000000000000000000000",
        },
        "signatureRequest": {
          "data": "0x1234",
          "rawPayload": "0x5678",
          "type": "personal_sign",
        },
        "type": "user-operation-v060",
      }
    `);
  });
  it("transforms a prepared call UO v070 into a viem-compatible call", () => {
    const transformed = viemEncodePreparedCall(preparedCallV070);
    expect(transformed).toMatchInlineSnapshot(`
      {
        "chainId": 1,
        "data": {
          "callData": "0xb61d27f60000000000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
          "callGasLimit": 21000n,
          "factory": "0x1234567890123456789012345678901234567890",
          "factoryData": "0xabcdef",
          "maxFeePerGas": 1500000000n,
          "maxPriorityFeePerGas": 1500000000n,
          "nonce": 0n,
          "paymaster": "0x9876543210987654321098765432109876543210",
          "paymasterData": "0x1234",
          "paymasterPostOpGasLimit": 10000n,
          "paymasterVerificationGasLimit": 30000n,
          "preVerificationGas": 47464n,
          "sender": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          "verificationGasLimit": 100000n,
        },
        "feePayment": {
          "maxAmount": 1000000000n,
          "sponsored": false,
          "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        },
        "signatureRequest": {
          "data": {
            "domain": {
              "chainId": 1,
              "name": "Account",
              "verifyingContract": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
              "version": "1",
            },
            "message": {
              "content": "Hello",
            },
            "primaryType": "Message",
            "types": {
              "Message": [
                {
                  "name": "content",
                  "type": "string",
                },
              ],
            },
          },
          "rawPayload": "0xabcd",
          "type": "eth_signTypedData_v4",
        },
        "type": "user-operation-v070",
      }
    `);
  });
  it("transforms a prepared Authorization call a viem-compatible authorization", () => {
    const transformed = viemEncodePreparedCall(preparedCallAuthorization);
    expect(transformed).toMatchInlineSnapshot(`
      {
        "chainId": 1,
        "data": {
          "address": "0x1234567890123456789012345678901234567890",
          "nonce": 0,
        },
        "signatureRequest": {
          "rawPayload": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
          "type": "eip7702Auth",
        },
        "type": "authorization",
      }
    `);
  });
  it("transforms a prepared paymaster permit call a viem-compatible call type", () => {
    const transformed = viemEncodePreparedCall(preparedCallPermit);
    expect(transformed).toMatchInlineSnapshot(`
      {
        "data": {
          "domain": {
            "chainId": 1,
            "name": "Paymaster",
            "verifyingContract": "0x9876543210987654321098765432109876543210",
            "version": "1",
          },
          "message": {
            "deadline": "0x639c8640",
            "nonce": "0x0",
            "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
            "spender": "0x9876543210987654321098765432109876543210",
            "value": "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
          },
          "primaryType": "Permit",
          "types": {
            "Permit": [
              {
                "name": "owner",
                "type": "address",
              },
              {
                "name": "spender",
                "type": "address",
              },
              {
                "name": "value",
                "type": "uint256",
              },
              {
                "name": "nonce",
                "type": "uint256",
              },
              {
                "name": "deadline",
                "type": "uint256",
              },
            ],
          },
        },
        "modifiedRequest": {
          "calls": [
            {
              "data": "0xabcdef",
              "to": "0x1234567890123456789012345678901234567890",
              "value": 0n,
            },
          ],
          "capabilities": {
            "alchemyPaymaster": {
              "erc20": {
                "maxTokenAmount": 1000000000n,
                "postOpSettings": {
                  "autoApprove": {
                    "amount": 1267650600228229401496703205375n,
                    "below": 4096n,
                  },
                },
                "preOpSettings": {
                  "autoPermit": {
                    "amount": 115792089237316195423570985008687907853269984665640564039457584007913129639935n,
                    "below": 4096n,
                    "durationSeconds": 86400n,
                  },
                  "permitDetails": {
                    "deadline": 1n,
                    "value": 2n,
                  },
                },
                "tokenAddress": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
              },
              "policyId": "my-policy-123",
            },
            "eip7702Auth": true,
            "gasParamsOverride": {
              "callGasLimit": 21000n,
              "maxFeePerGas": {
                "multiplier": 1.2,
              },
              "maxPriorityFeePerGas": 1500000000n,
              "paymasterPostOpGasLimit": 10000n,
              "paymasterVerificationGasLimit": {
                "multiplier": 1.1,
              },
              "preVerificationGas": 4660n,
              "verificationGasLimit": {
                "multiplier": 1.5,
              },
            },
            "nonceOverride": {
              "nonceKey": 0n,
            },
            "permissions": {
              "context": "0x1234abcd",
            },
          },
          "chainId": 1,
          "from": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          "paymasterPermitSignature": {
            "data": {
              "r": "0x0",
              "s": "0x0",
              "yParity": 0,
            },
            "type": "secp256k1",
          },
        },
        "signatureRequest": {
          "data": {
            "domain": {
              "chainId": 1,
              "name": "Paymaster",
              "verifyingContract": "0x9876543210987654321098765432109876543210",
              "version": "1",
            },
            "message": {
              "deadline": "0x639c8640",
              "nonce": "0x0",
              "owner": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
              "spender": "0x9876543210987654321098765432109876543210",
              "value": "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
            },
            "primaryType": "Permit",
            "types": {
              "Permit": [
                {
                  "name": "owner",
                  "type": "address",
                },
                {
                  "name": "spender",
                  "type": "address",
                },
                {
                  "name": "value",
                  "type": "uint256",
                },
                {
                  "name": "nonce",
                  "type": "uint256",
                },
                {
                  "name": "deadline",
                  "type": "uint256",
                },
              ],
            },
          },
          "rawPayload": "0x1234567890abcdef",
          "type": "eth_signTypedData_v4",
        },
        "type": "paymaster-permit",
      }
    `);
  });

  describe("round-trip encode/decode", () => {
    it("should encode then decode UO v060 and get back original", () => {
      const encoded = viemEncodePreparedCall(preparedCallV060);
      const decoded = viemDecodePreparedCall(encoded);
      expect(decoded).toEqual(preparedCallV060);
    });

    it("should encode then decode UO v070 and get back original", () => {
      const encoded = viemEncodePreparedCall(preparedCallV070);
      const decoded = viemDecodePreparedCall(encoded);
      expect(decoded).toEqual(preparedCallV070);
    });

    it("should encode then decode Authorization and get back original", () => {
      const encoded = viemEncodePreparedCall(preparedCallAuthorization);
      const decoded = viemDecodePreparedCall(encoded);
      expect(decoded).toEqual(preparedCallAuthorization);
    });

    it("should encode then decode Paymaster Permit and get back original", () => {
      const encoded = viemEncodePreparedCall(preparedCallPermit);
      const decoded = viemDecodePreparedCall(encoded);
      expect(decoded).toEqual(preparedCallPermit);
    });
  });
});

const preparedCallV060 = {
  type: "user-operation-v060",
  data: {
    sender: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    nonce: "0x0",
    initCode: "0x",
    callData:
      "0xb61d27f60000000000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
    callGasLimit: "0x5208",
    verificationGasLimit: "0x186a0",
    preVerificationGas: "0xb968",
    maxFeePerGas: "0x59682f00",
    maxPriorityFeePerGas: "0x59682f00",
    paymasterAndData: "0x",
  },
  chainId: "0x1",
  signatureRequest: {
    type: "personal_sign",
    data: "0x1234",
    rawPayload: "0x5678",
  },
  feePayment: {
    sponsored: true,
    tokenAddress: "0x0000000000000000000000000000000000000000",
    maxAmount: "0x0",
  },
} as const satisfies PreparedCall_UserOpV060;

const preparedCallV070 = {
  type: "user-operation-v070",
  data: {
    sender: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    nonce: "0x0",
    factory: "0x1234567890123456789012345678901234567890",
    factoryData: "0xabcdef",
    callData:
      "0xb61d27f60000000000000000000000001234567890123456789012345678901234567890000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000000",
    callGasLimit: "0x5208",
    verificationGasLimit: "0x186a0",
    preVerificationGas: "0xb968",
    maxFeePerGas: "0x59682f00",
    maxPriorityFeePerGas: "0x59682f00",
    paymaster: "0x9876543210987654321098765432109876543210",
    paymasterData: "0x1234",
    paymasterVerificationGasLimit: "0x7530",
    paymasterPostOpGasLimit: "0x2710",
  },
  chainId: "0x1",
  signatureRequest: {
    type: "eth_signTypedData_v4",
    data: {
      domain: {
        name: "Account",
        version: "1",
        chainId: 1,
        verifyingContract: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      },
      types: {
        Message: [{ name: "content", type: "string" }],
      },
      primaryType: "Message",
      message: {
        content: "Hello",
      },
    },
    rawPayload: "0xabcd",
  },
  feePayment: {
    sponsored: false,
    tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    maxAmount: "0x3b9aca00",
  },
} as const satisfies PreparedCall_UserOpV070;

const preparedCallAuthorization = {
  type: "authorization",
  data: {
    address: "0x1234567890123456789012345678901234567890",
    nonce: "0x0",
  },
  chainId: "0x1",
  signatureRequest: {
    type: "eip7702Auth",
    rawPayload:
      "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
} as const satisfies PreparedCall_Authorization;

const preparedCallPermit = {
  type: "paymaster-permit",
  modifiedRequest: {
    calls: [
      {
        to: "0x1234567890123456789012345678901234567890",
        data: "0xabcdef",
        value: "0x0",
      },
    ],
    from: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    chainId: "0x1",
    capabilities: {
      paymasterService: {
        policyId: "my-policy-123",
        erc20: {
          tokenAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
          maxTokenAmount: "0x3b9aca00",
          preOpSettings: {
            autoPermit: {
              below: "0x1000",
              amount:
                "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
              durationSeconds: "0x15180",
            },
            permitDetails: {
              deadline: "0x1",
              value: "0x2",
            },
          },
          postOpSettings: {
            autoApprove: {
              below: "0x1000",
              amount: "0xfffffffffffffffffffffffff",
            },
          },
        },
      },
      permissions: {
        context: "0x1234abcd",
      },
      // These can all be absolute or multiplier.
      gasParamsOverride: {
        preVerificationGas: "0x1234",
        verificationGasLimit: { multiplier: 1.5 },
        callGasLimit: "0x5208",
        paymasterVerificationGasLimit: { multiplier: 1.1 },
        paymasterPostOpGasLimit: "0x2710",
        maxFeePerGas: { multiplier: 1.2 },
        maxPriorityFeePerGas: "0x59682f00",
      },
      eip7702Auth: true,
      nonceOverride: {
        nonceKey: "0x0",
      },
    },
    paymasterPermitSignature: {
      type: "secp256k1",
      data: {
        r: "0x0",
        s: "0x0",
        yParity: "0x0",
      },
    },
  },
  data: {
    domain: {
      name: "Paymaster",
      version: "1",
      chainId: 1,
      verifyingContract: "0x9876543210987654321098765432109876543210",
    },
    types: {
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Permit",
    message: {
      owner: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      spender: "0x9876543210987654321098765432109876543210",
      value:
        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      nonce: "0x0",
      deadline: "0x639c8640",
    },
  },
  signatureRequest: {
    type: "eth_signTypedData_v4",
    data: {
      domain: {
        name: "Paymaster",
        version: "1",
        chainId: 1,
        verifyingContract: "0x9876543210987654321098765432109876543210",
      },
      types: {
        Permit: [
          { name: "owner", type: "address" },
          { name: "spender", type: "address" },
          { name: "value", type: "uint256" },
          { name: "nonce", type: "uint256" },
          { name: "deadline", type: "uint256" },
        ],
      },
      primaryType: "Permit",
      message: {
        owner: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        spender: "0x9876543210987654321098765432109876543210",
        value:
          "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        nonce: "0x0",
        deadline: "0x639c8640",
      },
    },
    rawPayload: "0x1234567890abcdef",
  },
} as const satisfies PreparedCall_Permit;
