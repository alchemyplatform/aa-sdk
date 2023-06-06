import {Flex, Heading} from "@chakra-ui/react";

export function ErrorScreen({error}: {error?: string}) {
  return (
    <Flex
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
    >
      <Heading color="red">
        {error || "Something went wrong. Please try again later."}
      </Heading>
    </Flex>
  );
}
