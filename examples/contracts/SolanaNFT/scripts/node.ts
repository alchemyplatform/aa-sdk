import {
  createFungible,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  createTokenIfMissing,
  findAssociatedTokenPda,
  getSplAssociatedTokenProgramId,
  mintTokensTo,
} from "@metaplex-foundation/mpl-toolbox";
import {
  generateSigner,
  percentAmount,
  createGenericFile,
  signerIdentity,
  sol,
  createAmount,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { base58 } from "@metaplex-foundation/umi/serializers";
import fs from "fs";
import path from "path";


// Create the wrapper function
const createAndMintTokens = async () => {
  const DUCK_IMAGE = "duckImage.png";

  const LAMPORTS_PER_SOL = 1000000000;
  const API_KEY = "1qN27RFoMvqeyzJq4V2wBT-AJEFIn74m"
  console.log({ API_KEY })
  /// API KEY ?? 
  const umi = createUmi(`https://solana-devnet.g.alchemy.com/v2/${API_KEY}`, {
    wsEndpoint: "wss://api.devnet.solana.com",
    commitment: "confirmed",
  })
  .use(mplTokenMetadata())
  .use(irysUploader())

  // Generate a new keypair signer.
  const signer = generateSigner(umi);

  // Tell umi to use the new signer.
  umi.use(signerIdentity(signer));

  // Airdrop 1 SOL to the identity
  // if you end up with a 429 too many requests error, you may have to use
  // the a different rpc other than the free default one supplied.

  // From the docs on the createAmount: An amount of SOL represented using the lowest possible unit — i.e. lamports.
  const dropAmount = createAmount(1 * LAMPORTS_PER_SOL, "SOL", 9);


  await umi.rpc.airdrop(umi.identity.publicKey, dropAmount);

  // use `fs` to read file via a string path.
  const imageFile = fs.readFileSync(`./${DUCK_IMAGE}`);

  // Use `createGenericFile` to transform the file into a `GenericFile` type
  // that Umi can understand. Make sure you set the mimi tag type correctly
  // otherwise Arweave will not know how to display your image.

  const umiImageFile = createGenericFile(imageFile, DUCK_IMAGE, {
    tags: [{ name: "contentType", value: "image/png" }],
  });

  // Here we upload the image to Arweave via Irys and we get returned a uri
  // address where the file is located. You can log this out but as the
  // uploader can takes an array of files it also returns an array of uris.
  // To get the uri we want we can call index [0] in the array.

  console.log("Uploading image to Arweave via Irys");
  const imageUri = await umi.uploader.upload([umiImageFile]).catch((err) => {
    throw new Error(err);
  });

  console.log(imageUri[0]);

  const metadata = {
    name: "Alchemy Duck",
    symbol: "ALCHTESTDUCK",
    description: "Alchemy Duck is a token created on the Solana blockchain",
    image: imageUri, // Either use variable or paste in string of the uri.
  };
  console.log("Uploading metadata to Arweave via Irys");
  const metadataUri = await umi.uploader.uploadJson(metadata).catch((err) => {
    throw new Error(err);
  });

  // Creating the mintIx

  const mintSigner = generateSigner(umi);

  const createFungibleIx = createFungible(umi, {
    mint: mintSigner,
    name: "The Kitten Coin",
    uri: metadataUri, // we use the `metedataUri` variable we created earlier that is storing our uri.
    sellerFeeBasisPoints: percentAmount(0),
    decimals: 0, // set the amount of decimals you want your token to have.
  });

  // This instruction will create a new Token Account if required, if one is found then it skips.

  const createTokenIx = createTokenIfMissing(umi, {
    mint: mintSigner.publicKey,
    owner: umi.identity.publicKey,
    ataProgram: getSplAssociatedTokenProgramId(umi),
  });

  // The final instruction (if required) is to mint the tokens to the token account in the previous ix.

  const mintTokensIx = mintTokensTo(umi, {
    mint: mintSigner.publicKey,
    token: findAssociatedTokenPda(umi, {
      mint: mintSigner.publicKey,
      owner: umi.identity.publicKey,
    }),
    amount: BigInt(1000),
  });

  // The last step is to send the ix's off in a transaction to the chain.
  // Ix's here can be omitted and added as needed during the transaction chain.
  // If for example you just want to create the Token without minting
  // any tokens then you may only want to submit the `createToken` ix.

  console.log("Sending transaction")
  const tx = await createFungibleIx
    .add(createTokenIx)
    .add(mintTokensIx)
    .sendAndConfirm(umi);

  // finally we can deserialize the signature that we can check on chain.
  const signature = base58.deserialize(tx.signature)[0];

  // Log out the signature and the links to the transaction and the NFT.
  // Explorer links are for the devnet chain, you can change the clusters to mainnet.
  console.log('\nTransaction Complete')
  console.log('View Transaction on Solana Explorer')
  console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`)
  console.log('View Token on Solana Explorer')
  console.log(`https://explorer.solana.com/address/${mintSigner.publicKey}?cluster=devnet`)

};

// run the wrapper function
createAndMintTokens();
