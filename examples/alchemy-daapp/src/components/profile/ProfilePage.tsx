import {Box, BoxProps, Heading, HStack, VStack} from "@chakra-ui/react";
import {memo, useCallback} from "react";
import NFTs from "./NFTs";

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
      style={{margin: "0px"}}
    >
      {label}:
    </Heading>
    <Heading
      size="sm"
      fontWeight="medium"
      color="gray.700"
      style={{margin: "0px"}}
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

function UnMemoProfilePage({address}: {address: string}) {
  const copyAddressTextToClipboard = useCallback(async () => {
    if ("clipboard" in navigator && address) {
      await navigator.clipboard.writeText(address);
      alert("Copied Address to Clipboard");
      return;
    }
  }, [address]);

  return (
    <HStack gap={5} alignItems="flex-start" padding={25}>
      <VStack gap={5} w="300px">
        <Box cursor="pointer" onClick={copyAddressTextToClipboard}>
          <ProfileAttribute
            label="Address"
            value={`${address?.substring(0, 15)}...`}
          />
        </Box>
      </VStack>
      <VStack flex={1} gap={5} padding="10px" overflow="hidden">
        <ProfileDetailCard>
          <Heading size="sm" margin={0} fontWeight="semibold" color="gray.500">
            Achievements
          </Heading>
          <NFTs maxH="225px" overflowY="auto" address={address} />
        </ProfileDetailCard>
      </VStack>
    </HStack>
  );
}

export const ProfilePage = memo(UnMemoProfilePage);
