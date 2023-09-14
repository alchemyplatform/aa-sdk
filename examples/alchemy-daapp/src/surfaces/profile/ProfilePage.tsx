import {
  Avatar,
  Box,
  BoxProps,
  Heading,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { memo, useCallback } from "react";
import NftSection from "./NftSection";
import { useAppState } from "../../clients/appState";
import { useNetwork } from "wagmi";
import { base, baseGoerli } from "viem/chains";

const ProfileAttribute = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <VStack alignItems="flex-start">
    <Heading
      size="sm"
      fontWeight="semibold"
      color="gray.500"
      style={{ margin: "0px" }}
    >
      {label}:
    </Heading>
    <Heading
      size="sm"
      fontWeight="medium"
      color="gray.700"
      style={{ margin: "0px" }}
    >
      {value}
    </Heading>
  </VStack>
);

const ProfileDetailCard = ({
  children,
  ...boxProps
}: React.PropsWithChildren<BoxProps>) => (
  <VStack
    w="100%"
    padding={10}
    alignItems="flex-start"
    boxShadow="0 4px 5px rgba(0, 0, 0, 0.1), 0 6px 5px rgba(0, 0, 0, 0.1)"
    borderRadius={10}
    {...boxProps}
  >
    {children}
  </VStack>
);

function UnMemoProfilePage() {
  const { state, eoaAddress, scwAddresses } = useAppState();
  const {chain} = useNetwork();
  const isBase = chain?.id === baseGoerli.id || chain?.id === base.id;
  const copyAddressTextToClipboard = useCallback((address: string) => {
    return async () => {
      if ("clipboard" in navigator && address) {
        await navigator.clipboard.writeText(address);
        alert("Copied Address to Clipboard");
        return;
      }
    };
  }, []);

  if (state !== "HAS_SCW") {
    return null;
  }

  return (
    <HStack gap={5} alignItems="flex-start" padding={25}>
      <VStack alignItems="center" gap={5} w="300px">
        <Avatar size="2xl" />
        <VStack alignItems="start" gap={5}>
          <Box
            cursor="pointer"
            onClick={copyAddressTextToClipboard(eoaAddress!)}
          >
            <ProfileAttribute
              value={`${eoaAddress?.substring(0, 15)}...`}
              label="Owner Address"
            />
          </Box>
          {scwAddresses.map((address) => {
            return (
              <Box
                key={address}
                cursor="pointer"
                onClick={copyAddressTextToClipboard(address!)}
              >
                <ProfileAttribute
                  label="Smart Contract Address"
                  value={`${address?.substring(0, 15)}...`}
                />
              </Box>
            );
          })}
        </VStack>
      </VStack>
      <VStack flex={1} gap={5} padding="10px" overflow="hidden">
        <ProfileDetailCard>
          <Heading size="sm" margin={0} fontWeight="semibold" color="gray.500">
            <b>EOA:</b> {eoaAddress.slice(0, 9)}... NFTs
          </Heading>
          {isBase ? <Heading
              size="md"
              fontWeight="semibold"
              color="gray.500"
            >
              NFT APIs aren't available on Base (yet). Check out owned assets <a target="_blank" href={`${chain.blockExplorers?.default.url}/search?q=${eoaAddress}`}>here.</a>
            </Heading>
          : 
          <NftSection
            maxH="225px"
            overflowY="auto"
            address={eoaAddress}
            chainId={chain!.id}
          />}
        </ProfileDetailCard>
        {scwAddresses.map((address) => (
          <ProfileDetailCard key={address}>
            <Heading
              size="sm"
              margin={0}
              fontWeight="semibold"
              color="gray.500"
            >
              <b>SCW:</b> {address.slice(0, 9)}... NFTs
            </Heading>
            {isBase ? <Heading
              size="md"
              fontWeight="semibold"
              color="gray.500"
            >
              NFT APIs aren't available on Base (yet). Check out owned assets <a target="_blank" href={`${chain.blockExplorers?.default.url}/search?q=${address}`}>here.</a>
            </Heading>
          : 
          <NftSection
            maxH="225px"
            overflowY="auto"
            address={address}
            chainId={chain!.id}
          />}
          </ProfileDetailCard>
        ))}
      </VStack>
    </HStack>
  );
}

export const ProfilePage = memo(UnMemoProfilePage);
