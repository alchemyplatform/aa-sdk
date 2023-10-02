import { Center, Heading, Text, VStack } from "@chakra-ui/react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectPage() {
  return (
    <Center>
      <VStack gap={4}>
        <Heading size="lg">Welcome to the Alchemy example D🅰️🅰️pp!</Heading>
        <Text align="center">
          We're excited for you to start using account abstraction!! <br />
          Click below to connect your wallet, and create your own account
          abstracted smart contract wallet.
        </Text>
        <ConnectButton />
      </VStack>
    </Center>
  );
}
