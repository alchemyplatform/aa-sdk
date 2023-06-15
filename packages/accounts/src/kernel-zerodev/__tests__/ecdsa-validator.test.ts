import {BaseValidator, ValidatorMode} from "../validator/base";


describe("ECDSA Validator Test", () => {

    const dummyPrivateKey = "0x022430a80f723d8789f0d4fb346bdd013b546e4b96fcacf8aceca2b1a65a19dc"
    const dummyAddress = "0xabcfC3DB1e0f5023F5a4f40c03D149f316E6A5cc"
    const signer: HdAccountSigner = HdAccountSigner.privateKeyToHdAccountSigner(dummyPrivateKey)

    const ECDSA_VALIDATOR_ADDRESS = "0x180D6465F921C7E0DEA0040107D342c87455fFF5"

    const validator = new BaseValidator({
        validatorAddress: ECDSA_VALIDATOR_ADDRESS,
        mode: ValidatorMode.sudo,
        owner: signer
    })

    it("should return proper validator address", async () => {
        expect(await validator.getAddress()).toMatchInlineSnapshot(
            `"0x180D6465F921C7E0DEA0040107D342c87455fFF5"`
        );
    });

    it("should return proper owner address", async () => {
        expect(await validator.getOwner()).eql(
           OWNER_ADDRESS
        );
    });


    it("should sign hash properly", async () => {
        expect(await validator.signMessage("0xbc7299170f076afcbafe11da04482e72e3beccabcd82de0cd2797500e81b76c4")).eql(
            "0x6fc7396f56df15b5860f7e50fd3d98069fe561f0d941b1e94d6f4f198bb73d790f50ac8bbb71cd983e98f6acf2f0e31033c9b725d865552a502d98dafd405e8a1c"
        );
    });

    it("should sign hash properly without 0x", async () => {
        expect(await validator.signMessage("bc7299170f076afcbafe11da04482e72e3beccabcd82de0cd2797500e81b76c4")).eql(
            "0x5b42153e221c09d7293d2b2f5cf85041ddd9e22e3b9810c82194931040d739c83fe2e265bd27cdd9997ae6b6d0e982a7719edf7beb08768820c9651059c534921c"
        );
    });

    it("should return proper validation signature", async () => {
        expect(await validator.signValidatorCompatibleMessage("0xbc7299170f076afcbafe11da04482e72e3beccabcd82de0cd2797500e81b76c4")).eql(
            "0x000000006fc7396f56df15b5860f7e50fd3d98069fe561f0d941b1e94d6f4f198bb73d790f50ac8bbb71cd983e98f6acf2f0e31033c9b725d865552a502d98dafd405e8a1c"
        );
    });
})

