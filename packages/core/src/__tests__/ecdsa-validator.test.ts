import {HdAccountSigner} from "../signer/hd-account";
import {ECDSAValidator} from "../validator/kernel/ecdsa";
import {ValidatorMode} from "../validator/kernel/base";


describe("ECDSA Validator Test", () => {
    const OWNER_MNEMONIC = process.env.OWNER_MNEMONIC!;
    const OWNER_ADDRESS = process.env.OWNER_WALLET;

    const signer = HdAccountSigner.mnemonicToHdAccountSigner(OWNER_MNEMONIC)
    const ECDSA_VALIDATOR_ADDRESS = "0x180D6465F921C7E0DEA0040107D342c87455fFF5"

    const validator = new ECDSAValidator({
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
            "0x05a19be245a0cfdf2bbe2e5fe3317e1362a54394be91512f7c5837e20158bab908533abb254e783f6cb9f0fd6d475c8065b0c3b78dd9a04a28a381add42ebf201c"
        );
    });

    it("should return proper validation signature", async () => {
        expect(await validator.getSignature("0xbc7299170f076afcbafe11da04482e72e3beccabcd82de0cd2797500e81b76c4")).eql(
            "0x000000006fc7396f56df15b5860f7e50fd3d98069fe561f0d941b1e94d6f4f198bb73d790f50ac8bbb71cd983e98f6acf2f0e31033c9b725d865552a502d98dafd405e8a1c"
        );
    });
})

