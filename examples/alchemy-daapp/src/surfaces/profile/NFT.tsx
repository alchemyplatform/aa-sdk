import { Tooltip, Image } from "@chakra-ui/react";
import Link from "next/link";

interface NFTProps {
  address: string;
  tokenId: string;
  title: string;
  imageUrl: string;
}

export default function NFT({ address, tokenId, title, imageUrl }: NFTProps) {
  return (
    <Link
      href={`https://testnets.opensea.io/assets/mumbai/${address}/${Number(
        tokenId
      )}`}
      target="_blank"
      rel="noopener noreferrer"
      style={{ display: "block" }}
    >
      <Tooltip label={title}>
        <Image
          src={imageUrl}
          minH="75px"
          minW="75px"
          maxH="75px"
          maxW="75px"
          objectFit="cover"
          alt="nft"
          borderRadius="md"
        />
      </Tooltip>
    </Link>
  );
}
