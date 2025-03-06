import { LocalAccountSigner } from "../local-account.js";

describe("Local Account Signer Tests", () => {
  describe("Using HD Account", () => {
    const dummyMnemonic =
      "test test test test test test test test test test test test";

    it("should sign a hex message properly", async () => {
      const signer = LocalAccountSigner.mnemonicToAccountSigner(dummyMnemonic);
      expect(
        await signer.signMessage({
          raw: "0xabcfC3DB1e0f5023F5a4f40c03D149f316E6A5cc",
        })
      ).toMatchInlineSnapshot(
        '"0x35761512143ffd8da07c93c5a0136424fe935b48e77076f501a57745c16268bf0d9a5d6209b12d5f8b62f96f0991372e046092fd6b1e3bfa610eb51607a28f7e1b"'
      );
    });

    it("should sign a string message properly", async () => {
      const signer = LocalAccountSigner.mnemonicToAccountSigner(dummyMnemonic);
      expect(
        await signer.signMessage("icanbreakthistestcase")
      ).toMatchInlineSnapshot(
        '"0x6b2efa82d72558efad294b727741e1eb9ff4800e2d66ce5f0373454ebdd13573630985612c1d618f49f173f65cf83fc131f798cb65ae66f90f8f0b9d4fdbca881b"'
      );

      expect(
        await signer.signMessage("i will definitely break this test case")
      ).toMatchInlineSnapshot(
        '"0x6e9af75bfcb8ff5abbf8778dee0e0c5a02f150bf5bc13a4216b772f333b23be8419b761230d24309cac67e1497a44c5fdacec7cb22bfb1652d54845f69f80ba51b"'
      );
    });

    it("should sign a byte array correctly", async () => {
      const signer = LocalAccountSigner.mnemonicToAccountSigner(dummyMnemonic);
      expect(
        await signer.signMessage({
          raw: new TextEncoder().encode("hello, I'm moldy"),
        })
      ).toEqual(await signer.signMessage("hello, I'm moldy"));
    });
  });

  describe("Using Private Key Account", () => {
    const dummyPrivateKey =
      "0x022430a80f723d8789f0d4fb346bdd013b546e4b96fcacf8aceca2b1a65a19dc";

    it("should sign a hex message properly", async () => {
      const signer =
        LocalAccountSigner.privateKeyToAccountSigner(dummyPrivateKey);
      expect(
        await signer.signMessage({
          raw: "0xabcfC3DB1e0f5023F5a4f40c03D149f316E6A5cc",
        })
      ).toMatchInlineSnapshot(
        '"0x91b6680c8f442f46ca71fee15cdd8c9e25693baeb4006d1908a453fd145315ce21a5e7f2ce9760fc993d65e8450fa5225d8dee12972886bdacbb989ca0b09c6c1b"'
      );
    });

    it("should sign a string message properly", async () => {
      const signer =
        LocalAccountSigner.privateKeyToAccountSigner(dummyPrivateKey);
      expect(
        await signer.signMessage("icanbreakthistestcase")
      ).toMatchInlineSnapshot(
        '"0xabd26de022c2785a7d86c5c388f4adef5d93358b39fbb757463bc9edc78b7b86566cb1ab8c7ff3a52b10d98de6398aacc7b48aec92a3e280065a47b9698209541b"'
      );

      expect(
        await signer.signMessage("i will definitely break this test case")
      ).toMatchInlineSnapshot(
        '"0x02bf79312d59e4147aaf05eca4d232c32f378c9761366d931f24407464bb75281897963baea5301b0dbaffa8857a284f61a0e20a2444becf702b8ebe95e2b24b1b"'
      );
    });

    it("should sign a byte array correctly", async () => {
      const signer =
        LocalAccountSigner.privateKeyToAccountSigner(dummyPrivateKey);
      expect(
        await signer.signMessage({
          raw: new TextEncoder().encode("hello, I'm moldy"),
        })
      ).toEqual(await signer.signMessage("hello, I'm moldy"));
    });
  });
});
