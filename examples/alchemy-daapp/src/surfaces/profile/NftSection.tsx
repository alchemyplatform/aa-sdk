import { memo } from "react";
import NFT from "./NFT";
import { useNFTsQuery } from "./nftQuery";
import { LoadingScreen } from "../shared/LoadingScreen";
import { ErrorScreen } from "../shared/ErrorScreen";
import { BoxProps, Grid, Text } from "@chakra-ui/react";
import React from "react";

interface NFTsProps extends BoxProps {
  address: string;
  chainId: number;
}

const NftSection: React.NamedExoticComponent<NFTsProps> = memo(
  function NftSection({ address, chainId, ...boxProps }: NFTsProps) {
    const ownedNFTsQuery = useNFTsQuery(address, chainId);
    if (!address) {
      return <Text size="sm">No Address to Associate Achievements</Text>;
    }

    if (ownedNFTsQuery.isLoading) {
      return <LoadingScreen />;
    }

    if (!ownedNFTsQuery.data) {
      return <ErrorScreen />;
    }

    const ownedNfts = ownedNFTsQuery.data.ownedNfts;
    return (
      <>
        <Grid {...boxProps} templateColumns="repeat(8, 1fr)" gap={6}>
          {ownedNfts.map((value, idx) => (
            <NFT
              key={idx}
              title={value.title}
              imageUrl={value.metadata.image!}
              address={value.contract.address}
              tokenId={value.id.tokenId}
            />
          ))}
        </Grid>
        {ownedNfts.length === 0 && (
          <Text color="gray.500" size="sm">
            No NFTs for this wallet
          </Text>
        )}
      </>
    );
  }
);

export default NftSection;
