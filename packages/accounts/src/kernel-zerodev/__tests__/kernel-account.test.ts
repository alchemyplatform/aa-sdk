import {KernelHdConfig, KernelHdWalletProvider} from "../provider/implementation/kernel-hd-wallet";
import {concatHex, encodeAbiParameters, Hex, parseEther} from "viem";
import {polygonMumbai} from "viem/chains";
import {mnemonicToAccount} from "viem/accounts";
import {parseAbiParameters} from "abitype";


describe("Kernel Account Tests", () => {
    const chain = polygonMumbai
    const config: KernelHdConfig = {
        mnemonic: process.env.OWNER_MNEMONIC,
        chain,
        rpcProvider: `${chain.rpcUrls.alchemy.http[0]}/${[process.env.ALCHEMY_KEY]}`,
        validatorAddress: "0x180D6465F921C7E0DEA0040107D342c87455fFF5",
        accountFactoryAddress: "0x5D006d3880645ec6e254E18C1F879DAC9Dd71A39",
    }
    const gasPolicy = process.env.GAS_POLICY_ID
    const dummyHash = "0x6fc7396f56df15b5860f7e50fd3d98069fe561f0d941b1e94d6f4f198bb73d790f50ac8bbb71cd983e98f6acf2f0e31033c9b725d865552a502d98dafd405e8a1c"
    const ownerAccount = mnemonicToAccount(process.env.OWNER_MNEMONIC)

    const provider = new KernelHdWalletProvider(config)


    it("getAddress returns valid counterfactual address", async () => {

        //contract already deployed
        let signerWithProvider =  provider.connect()
        expect(await signerWithProvider.getAddress()).toMatchInlineSnapshot(
            `"0x97925A25C6B8E8902D2c68A4fcd90421a701d2E8"`
        );

        //contract already deployed
        signerWithProvider =  provider.connect(3n)
        expect(await signerWithProvider.getAddress()).toMatchInlineSnapshot(
            `"0xA7b2c01A5AfBCf1FAB17aCf95D8367eCcFeEb845"`
        );

        //contract not deployed
        signerWithProvider =  provider.connect(4n)
        expect(await signerWithProvider.getAddress()).toMatchInlineSnapshot(
            `"0x701a7FB6B53149aF2B1c73A1C9b30b0228382c55"`
        );

        //contract not deployed
        signerWithProvider =  provider.connect(5n)
        expect(await signerWithProvider.getAddress()).toMatchInlineSnapshot(
            `"0x5DBf2A2Ac5Be247A4Fc3852B41de136D3FbE0D3b"`
        );
    });


    it("getNonce returns valid nonce", async () => {

        //contract deployed but no transaction
        let signerWithProvider =  provider.connect()
        expect(await signerWithProvider.account?.getNonce()).eql(0n);

        //contract not deployed
        signerWithProvider =  provider.connect(4n)
        expect(await signerWithProvider.account?.getNonce()).eql(0n);

        //contract deployed with transaction
        signerWithProvider =  provider.connect(3n)
        expect(await signerWithProvider.account?.getNonce()).eql(1n);

    });

    it("encodeExecute returns valid encoded hash", async () => {

        //contract deployed
        let signerWithProvider =  provider.connect()
        expect(await signerWithProvider.account?.encodeExecute("0xA7b2c01A5AfBCf1FAB17aCf95D8367eCcFeEb845",0n,"0x")).eql(
            "0x51945447000000000000000000000000a7b2c01a5afbcf1fab17acf95d8367eccfeeb8450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        );

        //contract not deployed
        signerWithProvider =  provider.connect(4n)
        expect(await signerWithProvider.account?.encodeExecute("0xA7b2c01A5AfBCf1FAB17aCf95D8367eCcFeEb845",0n,"0x")).eql(
            "0x51945447000000000000000000000000a7b2c01a5afbcf1fab17acf95d8367eccfeeb8450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
        );

    });


    it("encodeExecuteDelegate returns valid encoded hash", async () => {

        //contract deployed
        let signerWithProvider =  provider.connect()
        expect(await signerWithProvider.account?.encodeExecuteDelegate("0xA7b2c01A5AfBCf1FAB17aCf95D8367eCcFeEb845",0n,"0x")).eql(
            "0x51945447000000000000000000000000a7b2c01a5afbcf1fab17acf95d8367eccfeeb8450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000"
        );

        //contract not deployed
        signerWithProvider =  provider.connect(4n)
        expect(await signerWithProvider.account?.encodeExecuteDelegate("0xA7b2c01A5AfBCf1FAB17aCf95D8367eCcFeEb845",0n,"0x")).eql(
            "0x51945447000000000000000000000000a7b2c01a5afbcf1fab17acf95d8367eccfeeb8450000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000"
        );

    });

    //

    it("signWithEip6492 should correctly sign the message", async () => {
        //TODO ensure that it is always deployed
        const messageToBeSigned: Hex = "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b"
        const magicBytes = "6492649264926492649264926492649264926492649264926492649264926492"
        const ownerSignedMessage = await ownerAccount.signMessage({message: messageToBeSigned})

        let signerWithProvider =  provider.connect()
        expect(await signerWithProvider.request({ method: "personal_sign", params: [
                messageToBeSigned,
                await signerWithProvider.getAddress()
            ]
        })).toBe(
            ownerSignedMessage
        );

        signerWithProvider = provider.connect(10000n)
        const factoryCode = "0x" + (await signerWithProvider.account?.getInitCode()).slice(42)
        const signature = encodeAbiParameters(
            parseAbiParameters('address, bytes, bytes'),
            [config.accountFactoryAddress,factoryCode,ownerSignedMessage]
        ) + magicBytes
        expect(await signerWithProvider.request({ method: "personal_sign", params: [
                messageToBeSigned,
                await signerWithProvider.getAddress()
            ]
        })).eql(
            signature
        );
    });


    it("signMessage should correctly sign the message", async () => {
        const messageToBeSigned: Hex = "0xa70d0af2ebb03a44dcd0714a8724f622e3ab876d0aa312f0ee04823285d6fb1b"
        const ownerSignedMessage = await ownerAccount.signMessage({message: messageToBeSigned})
        const validatorMessage = concatHex(["0x00000000",ownerSignedMessage])

        let signerWithProvider =  provider.connect()
        expect(await signerWithProvider.account?.signMessage(messageToBeSigned)).toBe(
            validatorMessage
        );

        signerWithProvider = provider.connect(10000n)
        expect(await signerWithProvider.account?.signMessage(messageToBeSigned)).toBe(
            validatorMessage
        );
    });

    it("sendUserOperation should fail to execute if gas fee not present", async () => {
        let signerWithProvider =  provider.connect(5n)


        const result = signerWithProvider.sendUserOperation({
            target: await signerWithProvider.getAddress(),
            data: "0x",
        });

        await expect(result).rejects.toThrowError();
    });

    it("sendUserOperation should execute with alchemy gas manager", async () => {
        let signerWithProvider =  provider.connect(3n)
        signerWithProvider = provider.addAlchemyPaymaster(signerWithProvider,gasPolicy)


        const result = signerWithProvider.sendUserOperation({
            target: await signerWithProvider.getAddress(),
            data: "0x",
            value: parseEther('0.000001')
        });

         expect(await result).to.be.eql("ama")
    });




    //non core functions
    it("should correctly identify whether account is deployed", async () => {

        //contract already deployed
        let signerWithProvider =  provider.connect()
        expect(await signerWithProvider.account.isAccountDeployed()).eql(true);

        //contract already deployed
        signerWithProvider =  provider.connect(3n)
        expect(await signerWithProvider.account.isAccountDeployed()).eql(true );

        //contract not deployed
        signerWithProvider =  provider.connect(4n)
        expect(await signerWithProvider.account.isAccountDeployed()).eql(false );

        //contract not deployed
        signerWithProvider =  provider.connect(5n)
        expect(await signerWithProvider.account.isAccountDeployed()).eql(false );
    });

})