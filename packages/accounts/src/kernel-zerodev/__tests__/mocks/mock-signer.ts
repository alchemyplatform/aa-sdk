import type {
  Address,
  Hex,
  SignTypedDataParams,
  SmartAccountSigner,
} from "@alchemy/aa-core";

export class MockSigner implements SmartAccountSigner {
  inner: any;

  signerType = "aa-sdk-tests";

  getAddress(): Promise<Address> {
    return Promise.resolve("0x48D4d3536cDe7A257087206870c6B6E76e3D4ff4");
  }

  signMessage(_msg: Uint8Array | Hex | string): Promise<Hex> {
    return Promise.resolve(
      "0x4d61c5c27fb64b207cbf3bcf60d78e725659cff5f93db9a1316162117dff72aa631761619d93d4d97dfb761ba00b61f9274c6a4a76e494df644d968dd84ddcdb1c"
    );
  }

  signTypedData(_params: SignTypedDataParams): Promise<`0x${string}`> {
    return Promise.resolve(
      "0x4d61c5c27fb64b207cbf3bcf60d78e725659cff5f93db9a1316162117dff72aa631761619d93d4d97dfb761ba00b61f9274c6a4a76e494df644d968dd84ddcdb1c"
    );
  }
}
