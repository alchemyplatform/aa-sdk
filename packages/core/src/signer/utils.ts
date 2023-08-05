import {
  concat,
  encodeAbiParameters,
  parseAbiParameters,
  type Address,
  type Hash,
  type Hex,
} from "viem";

type SignWith6492Params = {
  factoryAddress: Address;
  initCode: Hex;
  signature: Hash;
};

export const wrapWith6492 = ({
  factoryAddress,
  initCode,
  signature,
}: SignWith6492Params): Hash => {
  return concat([
    encodeAbiParameters(parseAbiParameters("address, bytes, bytes"), [
      factoryAddress,
      initCode,
      signature,
    ]),
    "0x6492649264926492649264926492649264926492649264926492649264926492",
  ]);
};
