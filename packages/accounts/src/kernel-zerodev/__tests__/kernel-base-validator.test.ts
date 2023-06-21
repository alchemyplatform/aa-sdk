import { KernelBaseValidator, ValidatorMode } from "../validator/base";
import { MockSignerValidator } from "./mocks/mock-signer-validator";

describe("Base Validator Test", () => {
  const dummyAddress = "0xabcfC3DB1e0f5023F5a4f40c03D149f316E6A5cc";

  const signer = new MockSignerValidator();
  const ECDSA_VALIDATOR_ADDRESS = "0x180D6465F921C7E0DEA0040107D342c87455fFF5";

  const validator = new KernelBaseValidator({
    validatorAddress: ECDSA_VALIDATOR_ADDRESS,
    mode: ValidatorMode.sudo,
    owner: signer,
  });

  it("should return proper validator address", async () => {
    expect(await validator.getAddress()).toMatchInlineSnapshot(
      `"${ECDSA_VALIDATOR_ADDRESS}"`
    );
  });

  it("should return proper owner address", async () => {
    expect(await validator.getOwner()).eql(dummyAddress);
  });

  it("should sign hash properly", async () => {
    expect(
      await validator.signMessageWithValidatorParams(
        "0xabcfC3DB1e0f5023F5a4f40c03D149f316E6A5cc"
      )
    ).eql(
      "0x0000000064e29e4786b3740ceffc2c1a932124ee74c29b552957ea3bde8913753d1763af4f03362e387d2badb33932e8fc4f7b3411a0a5ade32a5b708aa48c171632a6211b"
    );
  });

  it("should sign hash properly without 0x", async () => {
    expect(
      await validator.signMessageWithValidatorParams("icanbreakthistestcase")
    ).eql(
      "0x00000000abd26de022c2785a7d86c5c388f4adef5d93358b39fbb757463bc9edc78b7b86566cb1ab8c7ff3a52b10d98de6398aacc7b48aec92a3e280065a47b9698209541b"
    );
  });

  it("should return proper validation signature", async () => {
    expect(
      await validator.signMessageWithValidatorParams(
        "0xbc7299170f076afcbafe11da04482e72e3beccabcd82de0cd2797500e81b76c4"
      )
    ).eql(
      "0x000000006c21c7271c8403452c5a812c9ba776b33b12733953f154d36d989d379c92ec632b7a1997ca16203a7ef5fcd639bcaa3d5420b65e0774a8bca7fad6d1437024661c"
    );
  });
});
