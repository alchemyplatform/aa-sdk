import {PrivateKeySigner} from "../signer/private-key";


describe("Private Key Account Signer Tests", () => {

    const dummyPrivateKey = "0x022430a80f723d8789f0d4fb346bdd013b546e4b96fcacf8aceca2b1a65a19dc"
    const dummyAddress = "0xabcfC3DB1e0f5023F5a4f40c03D149f316E6A5cc"

    const signer: PrivateKeySigner = PrivateKeySigner.privateKeyToAccountSigner(dummyPrivateKey)

    it("should sign a hex message properly", async () => {
        expect(await signer.signMessage("0xab3430fgk78")).toMatchInlineSnapshot(
            `"0xcb2094233752c6f66fa660f2118c60d0b7b73a097004514c01100bf986f3950f5ffddcd38035774d2878b72b2fd2d8ad1be2739f1b0cd8f34352d7301fe368e61b"`
        );

        expect(await signer.signMessage("icanbreakthistestcase")).toMatchInlineSnapshot(
            `"0xabd26de022c2785a7d86c5c388f4adef5d93358b39fbb757463bc9edc78b7b86566cb1ab8c7ff3a52b10d98de6398aacc7b48aec92a3e280065a47b9698209541b"`
        );

        expect(await signer.signMessage("i will definately break this test case")).toMatchInlineSnapshot(
            `"0x907004e990bb1bca76d9fed6bf4a6b614a8d11b6430657cb99ae83fae55c9bc60571876d8c01832e4661dd4312fa08b799b6f59c9b9abddd67e181abc6aef17e1c"`
        );

        expect(await signer.signMessage(dummyAddress)).toMatchInlineSnapshot(
            `"0x64e29e4786b3740ceffc2c1a932124ee74c29b552957ea3bde8913753d1763af4f03362e387d2badb33932e8fc4f7b3411a0a5ade32a5b708aa48c171632a6211b"`
        );
    });

    it("should return wallet address", async () => {
        expect(await signer.getAddress()).eql(
            dummyAddress
        );

    });
})