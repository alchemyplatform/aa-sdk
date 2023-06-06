import {Flex, Spinner} from "@chakra-ui/react";

export function LoadingScreen() {
  return (
    <Flex
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
    >
      <Spinner />
    </Flex>
  );
}
