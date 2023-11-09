import {
  type Address,
  type Hex,
  type SignTypedDataParams,
  type SmartAccountSigner,
} from "@alchemy/aa-core";

export class MockSignerValidator implements SmartAccountSigner {
  inner: any;

  signerType = "aa-sdk-tests";

  signTypedData(_params: SignTypedDataParams): Promise<`0x${string}`> {
    return Promise.resolve("0xMOCK_SIGN_TYPED_DATA");
  }

  getAddress(): Promise<Address> {
    return Promise.resolve("0xabcfC3DB1e0f5023F5a4f40c03D149f316E6A5cc");
  }

  async signMessage(msg: Uint8Array | Hex | string): Promise<Hex> {
    switch (msg) {
      case "0xabcfC3DB1e0f5023F5a4f40c03D149f316E6A5cc":
        return "0x64e29e4786b3740ceffc2c1a932124ee74c29b552957ea3bde8913753d1763af4f03362e387d2badb33932e8fc4f7b3411a0a5ade32a5b708aa48c171632a6211b";
      case "icanbreakthistestcase":
        return "0xabd26de022c2785a7d86c5c388f4adef5d93358b39fbb757463bc9edc78b7b86566cb1ab8c7ff3a52b10d98de6398aacc7b48aec92a3e280065a47b9698209541b";
      case "0xbc7299170f076afcbafe11da04482e72e3beccabcd82de0cd2797500e81b76c4":
        return "0x6c21c7271c8403452c5a812c9ba776b33b12733953f154d36d989d379c92ec632b7a1997ca16203a7ef5fcd639bcaa3d5420b65e0774a8bca7fad6d1437024661c";
      default:
        throw new Error("Invalid message");
    }
  }
}
