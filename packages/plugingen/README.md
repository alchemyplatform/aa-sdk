# plugingen build-uo example

```bash
# from root of aa-sdk repo
yarn buld; yarn lint:write;

# cd into packages/plugingen, then link
cd packages/plugingen;
yarn link;

# configure in userop.json for userop command

# build a user operation using smart account client
plugingen build-uo -c "<path_to_userop_json>";

# build, sign a user operation using smart account client
plugingen sign-uo -c "<path_to_userop_json>"

# build, sign, and send a user operation using smart account client
plugingen send-uo -c "<path_to_userop_json>"

```

## Example userop.json

```ts
type UserOpConfigJson = {
  chain: number | string;

  connection_config:
    | string
    | {
        bundler: string;
        public: string;
      };

  entrypoint: "0.6.0" | "0.7.0";

  account: {
    owner: "<mnemonic_or_private_key>";
    type: "SimpleSmartAccount";
  };

  userop: {
    calldata:
      | `0x{string}`
      | {
          target: `0x{string}`;
          data: `0x{string}`;
          value?: bigint;
        }
      | [
          {
            target: `0x{string}`;
            data: `0x{string}`;
            value?: bigint;
          }
        ];

    overrides?: {
      maxFeePerGas?: bigint | `0x{string}` | number | { multiplier: number };
      maxPriorityFeePerGas?:
        | bigint
        | `0x{string}`
        | number
        | { multiplier: number };
      callGasLimit?: bigint | `0x{string}` | number | { multiplier: number };
      verificationGasLimit?:
        | bigint
        | `0x{string}`
        | number
        | { multiplier: number };
      preVerificationGas?:
        | bigint
        | `0x{string}`
        | number
        | { multiplier: number };

      nonceKey?: bigint;

      // valid if entrypoint is 0.6.0
      paymasterAndData?: `0x{string}`;

      // valid if entrypoint is 0.7.0.
      // the next four fields should either all exist together or none exists.
      paymaster?: `0x{string}`;
      paymasterData?: `0x{string}`;
      paymasterVerificationGasLimit?:
        | bigint
        | `0x{string}`
        | number
        | { multiplier: number };
      paymasterPostOpGasLimit?:
        | bigint
        | `0x{string}`
        | number
        | { multiplier: number };
    };
  };
};
```
