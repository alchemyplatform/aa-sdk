import {
  Avatar,
  Box,
  BoxProps,
  Heading,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { memo, useCallback } from "react";
import NFTs from "./NFTs";
import { useAppState } from "../../clients/appState";

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
  const { state, eoaAddress, scwAddress } = useAppState();
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
          <Box
            cursor="pointer"
            onClick={copyAddressTextToClipboard("0xsmartContractAddress")}
          >
            <ProfileAttribute
              label="Smart Contract Address"
              value={`${scwAddress?.substring(0, 15)}...`}
            />
          </Box>
        </VStack>
      </VStack>
      <VStack flex={1} gap={5} padding="10px" overflow="hidden">
        <ProfileDetailCard>
          <Heading size="sm" margin={0} fontWeight="semibold" color="gray.500">
            NFTs
          </Heading>
          <NFTs maxH="225px" overflowY="auto" address={eoaAddress} />
        </ProfileDetailCard>
      </VStack>
    </HStack>
  );
}

export const ProfilePage = memo(UnMemoProfilePage);
