import type { ICardItem } from "@models";
import { NftTokenType } from "alchemy-sdk";
import { parseEther } from "viem";

export default [
  {
    title: "Account Kit NFT",
    description:
      "You minted this NFT with an ERC-4337 smart account powered by Account Kit.",
    contract: {
      tokenType: NftTokenType.ERC721,
      address: "0x025C582D7d7ACA50ff37D730B628b3F65aC960C2",
    },
    metadata:
      "https://static.alchemyapi.io/assets/accountkit/demo_metadata.json",
    media: [
      {
        raw: "https://static.alchemyapi.io/assets/accountkit/accountkit.jpg",
      },
    ],
    price: parseEther("0.08"),
  },
] as ICardItem[];
